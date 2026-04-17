import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Mic, MicOff, ImagePlus, Bot,
  Zap, MapPin, CheckCircle, Loader, Map,
} from "lucide-react";
import type { AgentApiResponse, AgentResult, AgentStep, MapCommand, MapStateSnapshot, Msg } from "../types/ManagerAgentChat";
import { MsgBubble } from "../components/Manager/MessageBubble";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { ManagerMapBus as MapEventBus } from "../services/eventBus";

async function callAgent(
  message: string,
  hasImage: boolean,
  state: MapStateSnapshot,
): Promise<AgentResult> {
  const userId = localStorage.getItem("user_id");

  const res = await fetch("/api/v0/agents/agentic-message/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      "ngrok-skip-browser-warning": "69420",
    },
    body: JSON.stringify({
      message,
      ...(userId ? { user_id: parseInt(userId) } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error || `HTTP ${res.status}`);
  }

  const data: AgentApiResponse = await res.json();
  const commands: MapCommand[] = [];

  if (data.mode === "action" && data.results?.length) {
    for (const r of data.results) {
      if (r?.deposit_id != null || r?.id != null) {
        const depositId = r.deposit_id ?? r.id;
        const pt = state.points.find(p => p.id === depositId);
        if (pt) {
          commands.push({ type: "collect", pointId: pt.id });
          commands.push({ type: "fly_to", lat: pt.lat, lng: pt.lng });
          commands.push({ type: "highlight", pointId: pt.id });
        }
      }
    }
  }

  if (commands.length === 0) {
    const lower = data.response.toLowerCase() + " " + message.toLowerCase();
    if (/pending/i.test(lower))   commands.push({ type: "highlight_all_pending" });
    if (/collected/i.test(lower)) commands.push({ type: "highlight_all_collected" });
    if (/stat|report/i.test(lower)) commands.push({ type: "show_stats" });
    if (/clear|reset/i.test(lower)) commands.push({ type: "clear_highlights" });
  }

  const steps: AgentStep[] = [
    { id: "m", label: `Mode: ${data.mode}`, done: true },
    { id: "r", label: `Role: ${data.role}`, done: true },
    ...(data.results?.length ? [{ id: "a", label: `${data.results.length} action(s) executed`, done: true }] : []),
  ];

  return { reply: data.response, commands, steps };
}

export const AgentChat = ({ onClose }: { onClose: () => void }) => {
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: "init", role: "agent", ts: new Date(),
    text: "👋 I'm your **Map Intelligence Agent**. I have live access to your map and can take actions in real-time.\n\nTry *\"Show pending points\"*, *\"Mark deposit 3 as collected\"*, or *\"Generate a report\"*.",
  }]);
  const [input, setInput]         = useState("");
  const [image, setImage]         = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy]           = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const fileRef      = useRef<HTMLInputElement>(null);
  const mediaRef     = useRef<MediaRecorder | null>(null);

  useGSAP(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(containerRef.current, 
      { x: 50, opacity: 0, scale: 0.95, filter: "blur(12px)" }, 
      { x: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "back.out(1.2)" }
    );
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const handleClose = () => {
    gsap.to(containerRef.current, { x: 50, opacity: 0, scale: 0.9, filter: "blur(12px)", duration: 0.3, ease: "power2.in" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: onClose });
  };

  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text && !image) return;

    const userMsg: Msg = { id: Date.now().toString(), role: "user", ts: new Date(), text, image: image ?? undefined };
    setMsgs(p => [...p, userMsg]);
    setInput(""); setImage(null); setBusy(true);

    const thinkId = "think_" + Date.now();
    setMsgs(p => [...p, {
      id: thinkId, role: "agent", ts: new Date(), text: "",
      steps: [{ id: "t", label: "Neural processing…", done: false }], thinking: true,
    }]);

    try {
      const state  = MapEventBus.getState();
      const result = await callAgent(text, !!image, state);
      result.commands.forEach((cmd, i) => setTimeout(() => MapEventBus.sendCommand(cmd), i * 240));
      setMsgs(p => p.map(m => m.id === thinkId
        ? { ...m, text: result.reply, steps: result.steps, commands: result.commands, thinking: false }
        : m));
    } catch (e: any) {
      setMsgs(p => p.map(m => m.id === thinkId
        ? { ...m, text: `⚠️ Agent error: ${e?.message ?? "Execution failed"}`, thinking: false,
            steps: [{ id: "e", label: "Request failed", done: true }] }
        : m));
    } finally {
      setBusy(false);
    }
  }, [input, image]);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setImage(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const toggleMic = async () => {
    if (recording) {
      mediaRef.current?.stop(); setRecording(false);
      setTimeout(() => send("Analyze all pending points on map"), 350);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new MediaRecorder(stream);
        rec.start(); mediaRef.current = rec; setRecording(true);
        setTimeout(() => { if (mediaRef.current?.state === "recording") toggleMic(); }, 5000);
      } catch { setInput("Mic unavailable"); }
    }
  };

  const QUICK = ["Pending", "Col. Today", "Stats", "Refresh"];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-end p-4 font-mono">
      <div 
        ref={overlayRef}
        onClick={handleClose} 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" 
      />

      <div 
        ref={containerRef}
        onClick={e => e.stopPropagation()} 
        className="relative w-full max-w-[380px] h-full max-h-[800px] bg-slate-950/90 backdrop-blur-3xl 
                   border border-brand-green/20 rounded-[2.5rem] shadow-2xl shadow-black overflow-hidden flex flex-col"
      >
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-brand-green/10 to-transparent animate-[scan_8s_linear_infinite]" />
        </div>

        {/* Header */}
        <div className="relative z-10 px-6 pt-6 pb-4 bg-brand-green/5 border-bottom border-brand-green/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 border border-brand-green/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)] animate-pulse">
              <Bot size={24} className="text-brand-green" />
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-black text-brand-green tracking-[0.2em] uppercase">Intelligence Map</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-brand-green shadow-[0_0_8px_#22c55e]" />
                <span className="text-[10px] text-brand-green/60 font-black tracking-widest uppercase">Agent Online</span>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <LiveContextStrip />

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
          {msgs.map((m, i) => (
            <MsgBubble key={m.id} msg={m} delay={i * 50} />
          ))}
          {busy && !msgs.find(m => m.thinking) && (
            <div className="flex gap-2 p-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-green/40 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Preview Image */}
        {image && (
          <div className="px-6 mb-2">
            <div className="relative h-20 w-32 rounded-xl overflow-hidden border border-brand-green/30 group">
              <img src={image} className="w-full h-full object-cover" alt="context" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        )}

        {/* Input Dock */}
        <div className="relative z-10 px-6 pt-2 pb-8 bg-slate-950/80 border-t border-white/5 backdrop-blur-md">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK.map(q => (
              <button 
                key={q} 
                onClick={() => send(q)}
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-brand-green/5 border border-brand-green/10 text-brand-green/60 rounded-lg hover:bg-brand-green/10 hover:text-brand-green transition-all whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-3 bg-white/5 border border-white/10 p-2 pl-5 rounded-[1.5rem] focus-within:border-brand-green/30 transition-all">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Query the system…"
              rows={1}
              className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-slate-200 placeholder:text-slate-600 resize-none max-h-32"
            />
            
            <input ref={fileRef} type="file" accept="image/*" onChange={onImage} className="hidden" />
            
            <div className="flex gap-1.5 p-1">
              <button onClick={() => fileRef.current?.click()} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                <ImagePlus size={18} />
              </button>
              
              <button 
                onClick={toggleMic}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${recording ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 text-slate-500 hover:text-white'}`}
              >
                {recording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button 
                onClick={() => send()}
                disabled={busy || (!input.trim() && !image)}
                className="w-12 h-10 rounded-xl bg-brand-green flex items-center justify-center text-slate-950 disabled:opacity-20 disabled:grayscale transition-all shadow-lg shadow-brand-green/20"
              >
                {busy ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveContextStrip = () => {
  const [snap, setSnap] = useState<MapStateSnapshot>({ points: [] });
  useEffect(() => {
    const tick = () => setSnap(MapEventBus.getState());
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, []);
  
  const collected = snap.points.filter(p => p.status === "collected").length;
  const pending   = snap.points.filter(p => p.status === "pending").length;

  return (
    <div className="relative z-10 px-6 py-3 border-b border-white/5 flex gap-3 overflow-x-auto scrollbar-hide bg-slate-950/20">
      <Stat badge={`${collected} items`} label="Collected" color="text-brand-green" bg="bg-brand-green/10" Icon={CheckCircle} />
      <Stat badge={`${pending} items`} label="Pending" color="text-red-400" bg="bg-red-400/10" Icon={MapPin} />
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
        <Zap size={10} className="text-yellow-400 fill-yellow-400" />
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Sync</span>
      </div>
    </div>
  );
};

const Stat = ({ badge, label, color, bg, Icon }: any) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg} border border-white/5 shrink-0 transition-all hover:scale-105`}>
    <Icon size={12} className={color} />
    <div className="flex flex-col">
       <span className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</span>
       <span className="text-[10px] font-bold text-white/60 leading-none">{badge}</span>
    </div>
  </div>
);