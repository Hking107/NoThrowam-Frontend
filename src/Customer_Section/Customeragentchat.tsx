import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Mic,
  MicOff,
  Bot,
  Zap,
  ShoppingCart,
  Loader,
  Package,
  Compass,
} from "lucide-react";
import type { AgentApiResponse } from "../types/AgentAPIResponse";
import type {
  AgentResult,
  AgentStep,
  MapCommand,
  MapStateSnapshot,
  MapStateSnapshotLocal,
  Msg,
  PurchaseState,
} from "../types/AIMessage";
import { CustomerMapBus as MapEventBus } from "../services/eventBus";
import CustMsgBubble from "../components/Customer/CustomerMessageBubble";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PurchaseBus } from "../services/eventBus";

async function callAgent(
  message: string,
  state: MapStateSnapshot,
  currentPurchase: PurchaseState,
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
  let purchaseState: PurchaseState | undefined;

  if (data.mode === "action" && data.results?.length) {
    for (const r of data.results) {
      if (r?.post_id || r?.proposal?.post) {
        const postId = r.post_id ?? r.proposal?.post;
        const pt = state.points.find((p) => p.id === postId);
        if (pt) {
          commands.push({ type: "open_purchase", pointId: pt.id, quantity: 1 });
          commands.push({ type: "fly_to", lat: pt.lat, lng: pt.lng });
          commands.push({ type: "highlight", pointId: pt.id });
          purchaseState = { phase: "selecting", pointId: pt.id, qty: 1 };
        }
      }
    }
  }

  const lower = data.response.toLowerCase();
  if (
    /available|market|lot|post|recyclable/i.test(lower) &&
    commands.length === 0
  ) {
    commands.push({ type: "highlight_all_available" });
  }

  const steps: AgentStep[] = [
    { id: "m", label: `Mode: ${data.mode}`, done: true },
    { id: "r", label: `Role: ${data.role}`, done: true },
    ...(data.results?.length
      ? [
          {
            id: "a",
            label: `${data.results.length} action(s) completed`,
            done: true,
          },
        ]
      : []),
  ];

  return { reply: data.response, commands, steps, purchaseState };
}

export const CustomerAgentChat = ({ onClose }: { onClose: () => void }) => {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "init",
      role: "agent",
      ts: new Date(),
      text: '👋 Hi! I\'m your **Shopping Assistant**.\n\nI can help you find recyclable materials, create proposals, and manage your purchases.\n\nTry *"Show me what\'s available"* or *"Create a proposal for post 1"*!',
    },
  ]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [purchase, setPurchase] = useState<PurchaseState>({ phase: "idle" });

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);

  useGSAP(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
    );
    gsap.fromTo(
      containerRef.current,
      { x: 50, opacity: 0, scale: 0.95, filter: "blur(12px)" },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "back.out(1.2)",
      },
    );
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);
  useEffect(() => PurchaseBus.onChange((s) => setPurchase(s)), []);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      x: 50,
      opacity: 0,
      scale: 0.9,
      filter: "blur(12px)",
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: onClose,
    });
  };

  const send = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text) return;

      const userMsg: Msg = {
        id: Date.now().toString(),
        role: "user",
        ts: new Date(),
        text,
      };
      setMsgs((p) => [...p, userMsg]);
      setInput("");
      setBusy(true);

      const thinkId = "think_" + Date.now();
      setMsgs((p) => [
        ...p,
        {
          id: thinkId,
          role: "agent",
          ts: new Date(),
          text: "",
          steps: [{ id: "t", label: "Searching market…", done: false }],
          thinking: true,
        },
      ]);

      try {
        const state = MapEventBus.getState();
        const result = await callAgent(text, state, purchase);
        result.commands.forEach((cmd, i) =>
          setTimeout(() => MapEventBus.sendCommand(cmd), i * 240),
        );

        if (result.purchaseState) {
          PurchaseBus.setState(result.purchaseState);
          setPurchase(result.purchaseState);
        }

        setMsgs((p) =>
          p.map((m) =>
            m.id === thinkId
              ? {
                  ...m,
                  text: result.reply,
                  steps: result.steps,
                  commands: result.commands,
                  thinking: false,
                }
              : m,
          ),
        );
      } catch (e: any) {
        setMsgs((p) =>
          p.map((m) =>
            m.id === thinkId
              ? {
                  ...m,
                  text: `⚠️ ${e?.message ?? "Execution error. Please try again."}`,
                  thinking: false,
                  steps: [{ id: "e", label: "Failed", done: true }],
                }
              : m,
          ),
        );
      } finally {
        setBusy(false);
      }
    },
    [input, purchase],
  );

  const toggleMic = async () => {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      setTimeout(() => send("Show available items to buy"), 350);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const rec = new MediaRecorder(stream);
        rec.start();
        mediaRef.current = rec;
        setRecording(true);
        setTimeout(() => {
          if (mediaRef.current?.state === "recording") toggleMic();
        }, 5000);
      } catch {
        setInput("Mic unavailable");
      }
    }
  };

  const QUICK = ["Search lots", "My offers", "How it works"];

  const phaseColor =
    purchase.phase === "done"
      ? "text-emerald-500"
      : purchase.phase === "payment"
        ? "text-amber-500"
        : purchase.phase === "selecting"
          ? "text-blue-500"
          : "text-slate-400";
  const phaseBg =
    purchase.phase === "done"
      ? "bg-emerald-50"
      : purchase.phase === "payment"
        ? "bg-amber-50"
        : purchase.phase === "selecting"
          ? "bg-blue-50"
          : "bg-slate-50";
  const phaseLabel =
    purchase.phase === "done"
      ? "✓ Commandé"
      : purchase.phase === "payment"
        ? "💳 Paiement"
        : purchase.phase === "selecting"
          ? "🛒 Panier"
          : "💬 Exploration";

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-end p-4 font-sans">
      <div
        ref={overlayRef}
        onClick={handleClose}
        className="absolute inset-0 bg-black/10 backdrop-blur-xs"
      />

      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[390px] h-full max-h-[820px] bg-white/95 backdrop-blur-3xl 
                   border border-brand-green/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Soft Aura */}
        <div className="absolute top-0 inset-x-0 h-40 bg-linear-to-b from-brand-green/20 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 p-6 pb-4 flex items-center gap-4 bg-white/50 backdrop-blur-xl border-b border-slate-50">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-green to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-green/20">
            <Bot size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-[15px] font-black text-slate-800 tracking-tight">
              EcoAssistant
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">
                En ligne
              </span>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${phaseBg} ${phaseColor} shadow-sm border border-black/5`}
          >
            {phaseLabel}
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <CustomerContextStrip purchase={purchase} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar scrollbar-customer">
          {msgs.map((m, i) => (
            <CustMsgBubble key={m.id} msg={m} delay={i * 40} />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Bar */}
        <div className="relative z-10 px-6 pt-2 pb-8 bg-white border-t border-slate-100">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100 text-slate-500 rounded-xl hover:bg-brand-green/5 hover:text-brand-green hover:border-brand-green/20 transition-all whitespace-nowrap shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-3 bg-slate-50 border border-slate-100 p-2 pl-5 rounded-[1.8rem] focus-within:bg-white focus-within:border-brand-green/30 focus-within:shadow-xl focus-within:shadow-brand-green/5 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Chercher un lot, poser une question…"
              rows={1}
              className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none max-h-32 font-medium"
            />

            <div className="flex gap-1.5 p-1">
              <button
                onClick={toggleMic}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${recording ? "bg-red-50 text-red-500 border border-red-100 shadow-lg shadow-red-500/10" : "bg-white border border-slate-100 text-slate-400 hover:text-slate-600 shadow-sm"}`}
              >
                {recording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="w-12 h-10 rounded-2xl bg-linear-to-br from-brand-green to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-brand-green/20 hover:scale-[1.05] active:scale-95 disabled:opacity-30 transition-all"
              >
                {busy ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerContextStrip = ({ purchase }: { purchase: PurchaseState }) => {
  const [snap, setSnap] = useState<MapStateSnapshotLocal>({
    points: [],
    cart: [],
  });
  useEffect(() => {
    const tick = () => setSnap(MapEventBus.getState());
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-10 px-6 py-3 border-b border-slate-50 flex gap-3 overflow-x-auto scrollbar-hide bg-slate-50/30">
      <ContextBadge
        label={`${snap.points.length} Lots`}
        color="text-brand-green"
        bg="bg-emerald-50"
        Icon={Package}
      />
      <ContextBadge
        label="Mes Offres"
        color="text-indigo-500"
        bg="bg-indigo-50"
        Icon={ShoppingCart}
      />
      <ContextBadge
        label="Exploration"
        color="text-amber-500"
        bg="bg-amber-50"
        Icon={Compass}
      />
    </div>
  );
};

const ContextBadge = ({ label, color, bg, Icon }: any) => (
  <div
    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg} border border-black/3 shrink-0 transition-all hover:scale-105 shadow-sm`}
  >
    <Icon size={12} className={color} />
    <span
      className={`text-[10px] font-black uppercase tracking-tight ${color}`}
    >
      {label}
    </span>
  </div>
);
