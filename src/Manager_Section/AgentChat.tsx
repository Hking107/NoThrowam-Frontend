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

    setMsgs(p => [...p, {
      id: thinkId, role: "agent", ts: new Date(), text: "",
      steps: [{ id: "t", label: "Consulting data sources…", done: false }], thinking: true,
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-end p-4 font-sans">
      <div 
        ref={overlayRef}
        onClick={handleClose} 
        className="absolute inset-0 bg-black/10 backdrop-blur-[4px]" 
      />

      <div 
        ref={containerRef}
        onClick={e => e.stopPropagation()} 
        className="relative w-full max-w-[380px] h-full max-h-[800px] bg-white/95 backdrop-blur-3xl 
                   border border-brand-green/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Soft Aura instead of Scanline */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-green/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 px-6 pt-6 pb-4 bg-white/50 backdrop-blur-xl border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center shadow-lg shadow-brand-green/10 animate-pulse">
              <Bot size={24} className="text-brand-green" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-black text-slate-800 tracking-tight">AI Waste Assistant</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-[10px] text-brand-green font-black tracking-widest uppercase">Agent Online</span>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <LiveContextStrip />

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar scrollbar-manager">
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
        <div className="relative z-10 px-6 pt-2 pb-8 bg-white border-t border-slate-100">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK.map(q => (
              <button 
                key={q} 
                onClick={() => send(q)}
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100 text-slate-500 rounded-lg hover:bg-brand-green/5 hover:text-brand-green transition-all whitespace-nowrap shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-3 bg-slate-50 border border-slate-100 p-2 pl-5 rounded-[1.5rem] focus-within:bg-white focus-within:border-brand-green/30 focus-within:shadow-xl focus-within:shadow-brand-green/5 transition-all">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Query the system…"
              rows={1}
              className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none max-h-32 font-medium"
            />
            
            <input ref={fileRef} type="file" accept="image/*" onChange={onImage} className="hidden" />
            
            <div className="flex gap-1.5 p-1">
              <button onClick={() => fileRef.current?.click()} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                <ImagePlus size={18} />
              </button>
              
              <button 
                onClick={toggleMic}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${recording ? 'bg-red-50 text-red-500 border border-red-100 shadow-lg shadow-red-500/10' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-600 shadow-sm'}`}
              >
                {recording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button 
                onClick={() => send()}
                disabled={busy || (!input.trim() && !image)}
                className="w-12 h-10 rounded-2xl bg-brand-green flex items-center justify-center text-white disabled:opacity-30 transition-all shadow-lg shadow-brand-green/20 hover:scale-[1.05] active:scale-95"
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
    <div className="relative z-10 px-6 py-3 border-b border-slate-50 flex gap-3 overflow-x-auto scrollbar-hide bg-slate-50/30">
      <Stat badge={`${collected} items`} label="Collected" color="text-brand-green" bg="bg-emerald-50" Icon={CheckCircle} />
      <Stat badge={`${pending} items`} label="Pending" color="text-red-400" bg="bg-red-50" Icon={MapPin} />
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm shrink-0">
        <Zap size={10} className="text-yellow-400 fill-yellow-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map Connected</span>
      </div>
    </div>
  );
};

const Stat = ({ badge, label, color, bg, Icon }: any) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg} border border-black/[0.03] shrink-0 transition-all hover:scale-105 shadow-sm`}>
    <Icon size={12} className={color} />
    <div className="flex flex-col">
       <span className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</span>
       <span className="text-[10px] font-bold text-slate-600 leading-none">{badge}</span>
    </div>
  </div>
);