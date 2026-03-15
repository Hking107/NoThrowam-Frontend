import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Mic, MicOff, Bot, User,
  Zap, ShoppingCart, CheckCircle, Loader, Package, CreditCard,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   MAP EVENT BUS (Customer version)
───────────────────────────────────────────────────── */
export type MapCommand =
  | { type: "highlight";             pointId: number }
  | { type: "highlight_all_available" }
  | { type: "fly_to";                lat: number; lng: number }
  | { type: "clear_highlights" }
  | { type: "open_purchase";         pointId: number; quantity: number }
  | { type: "show_cart" };

type MarketPoint = {
  id: number; label: string; category: string;
  lat: number; lng: number;
  fixedPrice: number; currency: string; fixedWeight: number;
};
type CartItem = { pointId: number; label: string; qty: number; unitPrice: number; currency: string };
type MapStateSnapshot = { points: MarketPoint[]; cart: CartItem[] };

const BUS = {
  _cmdListeners: [] as Array<(cmd: MapCommand) => void>,
  sendCommand(cmd: MapCommand) { this._cmdListeners.forEach(fn => fn(cmd)); },
  onCommand(fn: (cmd: MapCommand) => void) {
    this._cmdListeners.push(fn);
    return () => { this._cmdListeners = this._cmdListeners.filter(f => f !== fn); };
  },
  registerStateProvider(fn: () => MapStateSnapshot) { (window as any).__custMapState = fn; },
  getState(): MapStateSnapshot {
    const p = (window as any).__custMapState;
    return p ? p() : { points: [], cart: [] };
  },
};
export const MapEventBus = BUS;

/* ─────────────────────────────────────────────────────
   PURCHASE BUS
───────────────────────────────────────────────────── */
export type PurchaseState =
  | { phase: "idle" }
  | { phase: "selecting"; pointId: number; qty: number }
  | { phase: "payment";   items: CartItem[]; total: number; currency: string }
  | { phase: "processing"; method: string }
  | { phase: "done";      txRef: string };

export const PurchaseBus = {
  _listeners: [] as Array<(s: PurchaseState) => void>,
  _state: { phase: "idle" } as PurchaseState,
  setState(s: PurchaseState) { this._state = s; this._listeners.forEach(fn => fn(s)); },
  getState() { return this._state; },
  onChange(fn: (s: PurchaseState) => void) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(f => f !== fn); };
  },
};

/* ─────────────────────────────────────────────────────
   REAL API CALL  →  POST /api/v0/agents/agentic-message/
───────────────────────────────────────────────────── */
type AgentApiResponse = {
  success: boolean;
  mode: "answer" | "action";
  response: string;
  role: string;
  results?: any[];
};

type AgentStep = { id: string; label: string; done: boolean };
type AgentResult = {
  reply: string;
  commands: MapCommand[];
  steps: AgentStep[];
  purchaseState?: PurchaseState;
};

function mkStep(label: string): AgentStep {
  return { id: Math.random().toString(36).slice(2), label, done: true };
}

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

  /* ── Derive map commands from action results ── */
  const commands: MapCommand[] = [];
  let purchaseState: PurchaseState | undefined;

  if (data.mode === "action" && data.results?.length) {
    for (const r of data.results) {
      // Proposal created → open payment panel for that post
      if (r?.post_id || r?.proposal?.post) {
        const postId = r.post_id ?? r.proposal?.post;
        const pt = state.points.find(p => p.id === postId);
        if (pt) {
          commands.push({ type: "open_purchase", pointId: pt.id, quantity: 1 });
          commands.push({ type: "fly_to", lat: pt.lat, lng: pt.lng });
          commands.push({ type: "highlight", pointId: pt.id });
          purchaseState = { phase: "selecting", pointId: pt.id, qty: 1 };
        }
      }
    }
  }

  /* ── If the reply asks to show available ── */
  const lower = data.response.toLowerCase();
  if (/available|market|lot|post|recyclable/i.test(lower) && commands.length === 0) {
    commands.push({ type: "highlight_all_available" });
  }

  const steps: AgentStep[] = [
    mkStep(`Mode: ${data.mode}`),
    mkStep(`Role: ${data.role}`),
    ...(data.results?.length ? [mkStep(`${data.results.length} action(s) completed`)] : []),
  ];

  return { reply: data.response, commands, steps, purchaseState };
}

/* ─────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────── */
type Msg = {
  id: string; role: "user" | "agent"; text: string;
  steps?: AgentStep[]; commands?: MapCommand[]; ts: Date; thinking?: boolean;
};

export const CustomerAgentChat = ({ onClose }: { onClose: () => void }) => {
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: "init", role: "agent", ts: new Date(),
    text: "👋 Hi! I'm your **Shopping Assistant**.\n\nI can help you find recyclable materials, create proposals, and manage your purchases.\n\nTry *\"Show me what's available\"* or *\"Create a proposal for post 1\"*!",
  }]);
  const [input, setInput]         = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy]           = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [closing, setClosing]     = useState(false);
  const [purchase, setPurchase]   = useState<PurchaseState>({ phase: "idle" });

  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRef  = useRef<MediaRecorder | null>(null);

  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true))); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => PurchaseBus.onChange(s => setPurchase(s)), []);

  const handleClose = () => { setClosing(true); setTimeout(onClose, 360); };

  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;

    const userMsg: Msg = { id: Date.now().toString(), role: "user", ts: new Date(), text };
    setMsgs(p => [...p, userMsg]);
    setInput("");
    setBusy(true);

    const thinkId = "think_" + Date.now();
    setMsgs(p => [...p, {
      id: thinkId, role: "agent", ts: new Date(), text: "",
      steps: [{ id: "t", label: "Thinking…", done: false }], thinking: true,
    }]);

    try {
      const state  = MapEventBus.getState();
      const result = await callAgent(text, state, purchase);

      result.commands.forEach((cmd, i) => setTimeout(() => MapEventBus.sendCommand(cmd), i * 240));

      if (result.purchaseState) {
        PurchaseBus.setState(result.purchaseState);
        setPurchase(result.purchaseState);
      }

      setMsgs(p => p.map(m => m.id === thinkId
        ? { ...m, text: result.reply, steps: result.steps, commands: result.commands, thinking: false }
        : m));
    } catch (e: any) {
      setMsgs(p => p.map(m => m.id === thinkId
        ? { ...m, text: `⚠️ ${e?.message ?? "Something went wrong. Please try again."}`, thinking: false,
            steps: [{ id: "e", label: "Request failed", done: true }] }
        : m));
    } finally {
      setBusy(false);
    }
  }, [input, purchase]);

  const toggleMic = async () => {
    if (recording) {
      mediaRef.current?.stop(); setRecording(false);
      setTimeout(() => send("Show me what's available to buy"), 350);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new MediaRecorder(stream);
        rec.start(); mediaRef.current = rec; setRecording(true);
        setTimeout(() => { if (mediaRef.current?.state === "recording") toggleMic(); }, 8000);
      } catch { setInput("🎤 Microphone unavailable."); }
    }
  };

  const QUICK = ["What's available?", "Create a proposal", "My proposals", "How does it work?"];

  const phaseColor = purchase.phase === "done" ? "#16a34a"
                   : purchase.phase === "payment" ? "#d97706"
                   : purchase.phase === "selecting" ? "#2563eb" : "#94a3b8";
  const phaseLabel = purchase.phase === "done" ? "✅ Order Placed"
                   : purchase.phase === "payment" ? "💳 Choose Payment"
                   : purchase.phase === "selecting" ? "🛒 Cart Active" : "💬 Browsing";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;600;700&display=swap');
        .cac-root *{box-sizing:border-box;}
        .cac-root ::-webkit-scrollbar{width:3px;}
        .cac-root ::-webkit-scrollbar-thumb{background:rgba(34,197,94,.3);border-radius:3px;}
        .cac-msg b,.cac-msg strong{color:#15803d;font-weight:700;}
        .cac-msg em{color:#64748b;font-style:italic;}
        @keyframes cacIn{from{opacity:0;transform:translateX(48px) scale(.94);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
        @keyframes cacOut{from{opacity:1}to{opacity:0;transform:translateX(48px) scale(.94);filter:blur(6px)}}
        @keyframes msgPop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
        @keyframes stepIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
        @keyframes dot{0%,80%,100%{transform:scale(0);opacity:0}40%{transform:scale(1);opacity:1}}
        @keyframes glow2{0%,100%{box-shadow:0 0 12px rgba(34,197,94,.2)}50%{box-shadow:0 0 24px rgba(34,197,94,.45)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .cac-qbtn:hover{background:rgba(34,197,94,.15)!important;}
        .cac-ibtn:hover{background:rgba(0,0,0,.06)!important;}
        .cac-send:hover:not(:disabled){transform:scale(1.07);}
        .cac-send:active:not(:disabled){transform:scale(.95);}
      `}</style>

      <div onClick={handleClose} style={{
        position:"fixed",inset:0,zIndex:2000,
        background:"rgba(0,0,0,.18)",backdropFilter:"blur(3px)",
        transition:"opacity .36s",opacity:mounted&&!closing?1:0,
      }}/>

      <div className="cac-root" onClick={e=>e.stopPropagation()} style={{
        position:"fixed",top:14,right:14,bottom:14,width:375,zIndex:2100,
        display:"flex",flexDirection:"column",
        background:"rgba(255,255,255,.97)",
        backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",
        border:"1px solid rgba(34,197,94,.2)",borderRadius:24,overflow:"hidden",
        boxShadow:"0 32px 80px rgba(0,0,0,.18), 0 0 0 .5px rgba(34,197,94,.15) inset",
        fontFamily:"'Plus Jakarta Sans',sans-serif",
        animation:closing?"cacOut .36s cubic-bezier(.4,0,1,1) forwards":"cacIn .42s cubic-bezier(.34,1.56,.64,1) both",
      }}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:200,pointerEvents:"none",zIndex:0,
          background:"linear-gradient(180deg,rgba(220,252,231,.5) 0%,transparent 100%)",borderRadius:"24px 24px 0 0"}}/>

        {/* HEADER */}
        <div style={{
          position:"relative",zIndex:2,
          display:"flex",alignItems:"center",gap:12,padding:"15px 16px 13px",
          borderBottom:"1px solid rgba(34,197,94,.12)",
          background:"rgba(240,253,244,.8)",
        }}>
          <div style={{
            width:42,height:42,borderRadius:14,flexShrink:0,
            background:"linear-gradient(135deg,#22c55e,#16a34a)",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 14px rgba(34,197,94,.35)",
            animation:"glow2 3s ease-in-out infinite",
          }}>
            <Bot size={20} color="white"/>
          </div>
          <div style={{flex:1}}>
            <p style={{margin:0,color:"#15803d",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,letterSpacing:".02em"}}>
              Shopping Assistant
            </p>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e"}}/>
              <span style={{fontSize:9,color:"#4ade80",letterSpacing:".06em",fontWeight:600}}>ONLINE · AI POWERED</span>
            </div>
          </div>
          <div style={{
            padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:700,
            background:`${phaseColor}18`,border:`1px solid ${phaseColor}40`,color:phaseColor,
            whiteSpace:"nowrap",
          }}>{phaseLabel}</div>
          <button onClick={handleClose} className="cac-ibtn" style={{
            width:30,height:30,borderRadius:9,
            background:"rgba(0,0,0,.04)",border:"1px solid rgba(0,0,0,.07)",
            color:"#94a3b8",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s",
          }}><X size={13}/></button>
        </div>

        <CustomerContextStrip purchase={purchase}/>

        {/* MESSAGES */}
        <div style={{
          flex:1,overflowY:"auto",padding:"12px 12px 6px",
          display:"flex",flexDirection:"column",gap:10,
          position:"relative",zIndex:2,
        }}>
          {msgs.map((m,i) => <CustMsgBubble key={m.id} msg={m} delay={i*30}/>)}
          <div ref={bottomRef}/>
        </div>

        {/* INPUT BAR */}
        <div style={{position:"relative",zIndex:2,padding:"8px 12px 13px",
          borderTop:"1px solid rgba(34,197,94,.1)",background:"rgba(240,253,244,.5)"}}>
          <div style={{display:"flex",gap:5,marginBottom:8,overflowX:"auto",paddingBottom:2}}>
            {QUICK.map(q=>(
              <button key={q} onClick={()=>send(q)} className="cac-qbtn" style={{
                padding:"4px 10px",borderRadius:7,flexShrink:0,
                border:"1px solid rgba(34,197,94,.25)",
                background:"rgba(34,197,94,.08)",color:"#16a34a",
                fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",
                transition:"background .15s",whiteSpace:"nowrap",
              }}>{q}</button>
            ))}
          </div>

          <div style={{display:"flex",gap:7,alignItems:"flex-end",
            background:"white",
            border:"1.5px solid rgba(34,197,94,.2)",borderRadius:13,
            padding:"7px 7px 7px 11px",
            boxShadow:"0 2px 8px rgba(34,197,94,.08)"}}>
            <textarea
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder="Ask about products, prices, or proposals…"
              rows={1}
              style={{
                flex:1,background:"none",border:"none",outline:"none",
                color:"#1e293b",fontSize:13,
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                resize:"none",maxHeight:90,overflowY:"auto",lineHeight:1.5,
              }}
            />
            <button onClick={toggleMic} className={recording?"":"cac-ibtn"} style={{
              width:30,height:30,borderRadius:8,flexShrink:0,
              background:recording?"rgba(34,197,94,.15)":"rgba(0,0,0,.03)",
              border:recording?"1.5px solid rgba(34,197,94,.4)":"1px solid transparent",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              transition:"background .15s",
            }}>
              {recording?<MicOff size={14} color="#22c55e"/>:<Mic size={14} color="#94a3b8"/>}
            </button>
            <button onClick={()=>send()} disabled={busy} className="cac-send" style={{
              width:34,height:34,borderRadius:9,flexShrink:0,border:"none",
              background:busy?"rgba(34,197,94,.3)":"linear-gradient(135deg,#22c55e,#16a34a)",
              cursor:busy?"not-allowed":"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"transform .15s",
              boxShadow:"0 4px 12px rgba(34,197,94,.35)",
            }}>
              {busy
                ?<Loader size={14} color="white" style={{animation:"spin 1s linear infinite"}}/>
                :<Send size={14} color="white"/>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Context strip ── */
type MapStateSnapshotLocal = { points: MarketPoint[]; cart: CartItem[] };
const CustomerContextStrip = ({ purchase }: { purchase: PurchaseState }) => {
  const [snap, setSnap] = useState<MapStateSnapshotLocal>({ points: [], cart: [] });
  useEffect(() => {
    const tick = () => setSnap(MapEventBus.getState());
    tick();
    const id = setInterval(tick, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position:"relative",zIndex:2,
      display:"flex",gap:6,padding:"6px 12px",
      borderBottom:"1px solid rgba(0,0,0,.05)",overflowX:"auto",
    }}>
      {[
        {label:`${snap.points.length} lots`,color:"#16a34a",Icon:Package},
        {label:"Mes propositions",color:"#6366f1",Icon:ShoppingCart},
        {label:"LIVE",color:"#22c55e",Icon:Zap},
      ].map(({label,color,Icon})=>(
        <div key={label} style={{
          display:"flex",alignItems:"center",gap:5,
          padding:"3px 9px",borderRadius:7,whiteSpace:"nowrap",
          background:`${color}10`,border:`1px solid ${color}22`,
          color,fontSize:9,fontWeight:700,
        }}>
          <Icon size={10}/>{label}
        </div>
      ))}
    </div>
  );
};

/* ── Message bubble ── */
const CustMsgBubble = ({ msg, delay: d }: { msg: Msg; delay: number }) => {
  const isAgent = msg.role === "agent";
  return (
    <div style={{
      display:"flex",flexDirection:isAgent?"row":"row-reverse",gap:7,alignItems:"flex-start",
      animation:`msgPop .28s ease ${d}ms both`,
    }}>
      <div style={{
        width:28,height:28,borderRadius:9,flexShrink:0,marginTop:2,
        background:isAgent?"linear-gradient(135deg,#22c55e,#16a34a)":"rgba(0,0,0,.05)",
        border:isAgent?"none":"1px solid rgba(0,0,0,.08)",
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:isAgent?"0 3px 10px rgba(34,197,94,.3)":"none",
      }}>
        {isAgent?<Bot size={13} color="white"/>:<User size={13} color="#64748b"/>}
      </div>

      <div style={{maxWidth:"86%",display:"flex",flexDirection:"column",gap:5}}>
        {isAgent && msg.steps && msg.steps.length > 0 && (
          <div style={{
            background:"rgba(240,253,244,.8)",border:"1px solid rgba(34,197,94,.15)",
            borderRadius:10,padding:"7px 10px",display:"flex",flexDirection:"column",gap:3,
          }}>
            {msg.thinking ? (
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",
                    animation:`dot 1.2s ease-in-out ${i*.2}s infinite`}}/>
                ))}
                <span style={{fontSize:10,color:"#4ade80",marginLeft:4,fontWeight:600}}>Thinking…</span>
              </div>
            ) : msg.steps.map((s,i)=>(
              <div key={s.id} style={{
                display:"flex",alignItems:"center",gap:6,
                fontSize:10,color:"#4ade80",
                animation:`stepIn .22s ease ${i*70}ms both`,
                fontWeight:600,
              }}>
                <CheckCircle size={9}/>{s.label}
              </div>
            ))}
          </div>
        )}

        {isAgent && msg.commands && msg.commands.length > 0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
            {msg.commands.map((c,i)=>(
              <span key={i} style={{
                padding:"2px 8px",borderRadius:5,
                background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",
                color:"#16a34a",fontSize:9,fontWeight:700,letterSpacing:".04em",
              }}>⚡ {c.type.replace(/_/g," ").toUpperCase()}</span>
            ))}
          </div>
        )}

        {!!msg.text && (
          <div
            className="cac-msg"
            style={{
              padding:"10px 12px",
              borderRadius:isAgent?"4px 14px 14px 14px":"14px 4px 14px 14px",
              background:isAgent?"white":"rgba(34,197,94,.12)",
              border:isAgent?"1px solid rgba(0,0,0,.07)":"1px solid rgba(34,197,94,.2)",
              color:isAgent?"#1e293b":"#15803d",
              fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",
              boxShadow:isAgent?"0 2px 8px rgba(0,0,0,.06)":"none",
            }}
            dangerouslySetInnerHTML={{__html:
              msg.text
                .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
                .replace(/\*(.*?)\*/g,"<em>$1</em>")
            }}
          />
        )}

        <span style={{fontSize:9,color:"#94a3b8",textAlign:isAgent?"left":"right",fontWeight:500}}>
          {msg.ts.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
        </span>
      </div>
    </div>
  );
};