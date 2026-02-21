import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Mic, MicOff, ImagePlus, Bot, User,
  Zap, MapPin, CheckCircle, Loader, RotateCcw, Map,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   MAP EVENT BUS
   Manager_Map.tsx subscribes to this. AgentChat publishes.
   Zero coupling — no props/refs needed across files.
───────────────────────────────────────────────────── */
export type MapCommand =
  | { type: "collect";               pointId: number }
  | { type: "uncollect";             pointId: number }
  | { type: "highlight";             pointId: number }
  | { type: "highlight_all_pending" }
  | { type: "highlight_all_collected" }
  | { type: "fly_to";                lat: number; lng: number }
  | { type: "clear_highlights" }
  | { type: "show_stats" };

type MapStateSnapshot = {
  points: { id: number; label: string; status: "collected" | "pending"; lat: number; lng: number }[];
};

// Global singleton event bus
const BUS = {
  _cmdListeners: [] as Array<(cmd: MapCommand) => void>,
  _stateListeners: [] as Array<(cb: (s: MapStateSnapshot) => void) => void>,
  _lastState: null as MapStateSnapshot | null,

  sendCommand(cmd: MapCommand) {
    this._cmdListeners.forEach(fn => fn(cmd));
  },
  onCommand(fn: (cmd: MapCommand) => void) {
    this._cmdListeners.push(fn);
    return () => { this._cmdListeners = this._cmdListeners.filter(f => f !== fn); };
  },
  // Map registers a state-getter so agent can read live data
  registerStateProvider(fn: () => MapStateSnapshot) {
    (window as any).__mapStateProvider = fn;
  },
  getState(): MapStateSnapshot {
    const provider = (window as any).__mapStateProvider;
    return provider ? provider() : { points: [] };
  },
};

export const MapEventBus = BUS;

/* ─────────────────────────────────────────────────────
   MOCK AGENTIC BRAIN
   Replace callAgent() with your real API endpoint.
   Return { reply, commands, steps }.
───────────────────────────────────────────────────── */
type AgentStep   = { id: string; label: string; done: boolean };
type AgentResult = { reply: string; commands: MapCommand[]; steps: AgentStep[] };

function mkStep(label: string): AgentStep {
  return { id: Math.random().toString(36).slice(2), label, done: true };
}

async function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function callAgent(
  text: string,
  hasImage: boolean,
  state: MapStateSnapshot,
): Promise<AgentResult> {

  await delay(500 + Math.random() * 400);
  const lower = text.toLowerCase();
  const pts   = state.points;

  /* ── collect all ── */
  if (/collect (all|everything|them all)/.test(lower)) {
    const pending = pts.filter(p => p.status === "pending");
    await delay(300);
    return {
      reply: `✅ Dispatching collection for **${pending.length} pending** sites. Watch the map — markers are turning green now.`,
      steps: [
        mkStep("Scanning map state for pending points"),
        mkStep(`Found ${pending.length} uncollected sites`),
        mkStep("Generating bulk PATCH commands"),
        mkStep("Dispatching to collection layer"),
      ],
      commands: [
        ...pending.map(p => ({ type: "collect" as const, pointId: p.id })),
        { type: "highlight_all_collected" },
      ],
    };
  }

  /* ── show / highlight pending ── */
  if (/show.*pending|pending.*point|where.*pending/.test(lower)) {
    const pending = pts.filter(p => p.status === "pending");
    return {
      reply: `📍 **${pending.length} pending** sites:\n${pending.map(p => `• ${p.label}`).join("\n")}\n\nHighlighting them on the map now.`,
      steps: [
        mkStep("Querying map state"),
        mkStep(`Resolved ${pending.length} pending locations`),
        mkStep("Sending highlight commands"),
      ],
      commands: [{ type: "highlight_all_pending" }],
    };
  }

  /* ── show collected ── */
  if (/show.*collected|already collected|collected.*point/.test(lower)) {
    const done = pts.filter(p => p.status === "collected");
    return {
      reply: `✅ **${done.length} collected** sites:\n${done.map(p => `• ${p.label}`).join("\n")}`,
      steps: [mkStep("Querying collected status"), mkStep(`Found ${done.length} sites`)],
      commands: [{ type: "highlight_all_collected" }],
    };
  }

  /* ── stats / report ── */
  if (/stat|report|summary|how many|progress/.test(lower)) {
    const done = pts.filter(p => p.status === "collected").length;
    const pct  = pts.length ? Math.round((done / pts.length) * 100) : 0;
    return {
      reply: `📊 **Collection Report**\n• Total sites: ${pts.length}\n• Collected: ${done} (${pct}%)\n• Pending: ${pts.length - done}\n\n${pct < 50 ? "⚠️ Below 50% — prioritise pending routes." : "🎉 Good progress — above 50%!"}`,
      steps: [mkStep("Aggregating telemetry"), mkStep("Computing KPIs"), mkStep("Generating report")],
      commands: [{ type: "show_stats" }],
    };
  }

  /* ── collect specific point ── */
  const matchPt = pts.find(p =>
    lower.includes(p.label.toLowerCase()) ||
    lower.includes(`point ${p.id}`) ||
    lower.includes(`#${p.id}`) ||
    lower.includes(`site ${p.id}`)
  );
  if (matchPt && /collect|mark|done|finish/.test(lower)) {
    return {
      reply: `📍 Marking **${matchPt.label}** as collected. Marker turning green on map.`,
      steps: [
        mkStep(`Located: ${matchPt.label}`),
        mkStep("Sending PATCH /collection-status"),
        mkStep("Updating map marker"),
      ],
      commands: [
        { type: "collect", pointId: matchPt.id },
        { type: "fly_to", lat: matchPt.lat, lng: matchPt.lng },
        { type: "highlight", pointId: matchPt.id },
      ],
    };
  }

  /* ── navigate to specific ── */
  if (matchPt && /go to|show|navigate|zoom|fly|where is/.test(lower)) {
    return {
      reply: `🗺️ Flying to **${matchPt.label}** (${matchPt.status}).`,
      steps: [mkStep(`Resolved coords for ${matchPt.label}`), mkStep("Animating map camera")],
      commands: [
        { type: "fly_to", lat: matchPt.lat, lng: matchPt.lng },
        { type: "highlight", pointId: matchPt.id },
      ],
    };
  }

  /* ── image ── */
  if (hasImage) {
    await delay(600);
    return {
      reply: `🖼️ Image analysed — waste material detected. Would you like me to:\n• Mark the nearest site as pending\n• Log a new collection report\n• Assign this to a field agent`,
      steps: [
        mkStep("Uploading to vision model"),
        mkStep("Running waste-detection inference"),
        mkStep("Cross-referencing GPS with map layer"),
        mkStep("Awaiting your instruction"),
      ],
      commands: [],
    };
  }

  /* ── clear ── */
  if (/clear|reset/.test(lower)) {
    return {
      reply: "Map highlights cleared.",
      steps: [mkStep("Clearing visual overlays")],
      commands: [{ type: "clear_highlights" }],
    };
  }

  /* ── default help ── */
  return {
    reply: `I'm your **Map Intelligence Agent**. I can:\n• Show / highlight pending or collected points\n• Mark sites as collected or pending\n• Navigate the map camera\n• Generate collection reports\n• Analyse waste images\n\nTry: *"Show all pending points"* or *"Collect everything"*`,
    steps: [mkStep("Parsing intent"), mkStep("No specific action — returning help")],
    commands: [],
  };
}

/* ─────────────────────────────────────────────────────
   MESSAGE TYPE
───────────────────────────────────────────────────── */
type Msg = {
  id: string;
  role: "user" | "agent";
  text: string;
  image?: string;
  steps?: AgentStep[];
  commands?: MapCommand[];
  ts: Date;
  thinking?: boolean;
};

/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────── */
export const AgentChat = ({ onClose }: { onClose: () => void }) => {
  const [msgs, setMsgs]           = useState<Msg[]>([{
    id: "init", role: "agent", ts: new Date(),
    text: "👋 I'm your **Map Intelligence Agent**. I have live access to your map and can take actions on it in real-time.\n\nTry asking me to *show pending points*, *collect everything*, or *generate a report*.",
  }]);
  const [input, setInput]         = useState("");
  const [image, setImage]         = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy]           = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [closing, setClosing]     = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const mediaRef   = useRef<MediaRecorder | null>(null);
  const taRef      = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 360);
  };

  /* ── Send ── */
  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text && !image) return;

    const userMsg: Msg = {
      id: Date.now().toString(), role: "user", ts: new Date(),
      text, image: image ?? undefined,
    };
    setMsgs(p => [...p, userMsg]);
    setInput("");
    setImage(null);
    setBusy(true);

    // Thinking placeholder
    const thinkId = "think_" + Date.now();
    setMsgs(p => [...p, {
      id: thinkId, role: "agent", ts: new Date(), text: "",
      steps: [{ id: "t", label: "Thinking…", done: false }],
      thinking: true,
    }]);

    try {
      const state  = MapEventBus.getState();
      const result = await callAgent(text, !!image, state);

      // Dispatch commands with staggered timing so map animates step by step
      result.commands.forEach((cmd, i) => {
        setTimeout(() => MapEventBus.sendCommand(cmd), i * 240);
      });

      setMsgs(p => p.map(m => m.id === thinkId ? {
        ...m, text: result.reply, steps: result.steps,
        commands: result.commands, thinking: false,
      } : m));
    } catch {
      setMsgs(p => p.map(m => m.id === thinkId ? {
        ...m, text: "⚠️ Agent error — please try again.", thinking: false,
        steps: [{ id: "e", label: "Request failed", done: true }],
      } : m));
    } finally {
      setBusy(false);
    }
  }, [input, image]);

  /* ── Image upload ── */
  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setImage(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  /* ── Voice (mock transcript) ── */
  const toggleMic = async () => {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      setTimeout(() => send("Show me all pending collection points"), 350);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec    = new MediaRecorder(stream);
        rec.start();
        mediaRef.current = rec;
        setRecording(true);
        setTimeout(() => { if (mediaRef.current?.state === "recording") toggleMic(); }, 8000);
      } catch {
        setInput("🎤 Microphone unavailable — type your request.");
      }
    }
  };

  /* ── Quick prompts ── */
  const QUICK = ["Show pending", "Collect all", "Stats report", "Clear map"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@700;800&display=swap');
        .ac-root *{box-sizing:border-box;}
        .ac-root ::-webkit-scrollbar{width:3px;}
        .ac-root ::-webkit-scrollbar-thumb{background:rgba(34,197,94,.25);border-radius:3px;}
        .ac-msg b,.ac-msg strong{color:#86efac;font-weight:700;}
        .ac-msg em{color:rgba(255,255,255,.6);font-style:italic;}
        @keyframes acIn{from{opacity:0;transform:translateX(48px) scale(.94);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
        @keyframes acOut{from{opacity:1;transform:none;filter:none}to{opacity:0;transform:translateX(48px) scale(.94);filter:blur(6px)}}
        @keyframes msgPop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
        @keyframes stepIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
        @keyframes dot{0%,80%,100%{transform:scale(0);opacity:0}40%{transform:scale(1);opacity:1}}
        @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(500%)}}
        @keyframes glow{0%,100%{box-shadow:0 0 12px rgba(34,197,94,.3)}50%{box-shadow:0 0 28px rgba(34,197,94,.65)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .ac-qbtn:hover{background:rgba(34,197,94,.2)!important;}
        .ac-ibtn:hover{background:rgba(255,255,255,.1)!important;}
        .ac-send:hover:not(:disabled){transform:scale(1.07);}
        .ac-send:active:not(:disabled){transform:scale(.95);}
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position:"fixed",inset:0,zIndex:2000,
          background:"rgba(0,0,0,.32)",backdropFilter:"blur(2px)",
          transition:"opacity .36s",opacity:mounted&&!closing?1:0,
        }}
      />

      {/* Panel */}
      <div
        className="ac-root"
        onClick={e => e.stopPropagation()}
        style={{
          position:"fixed",top:14,right:14,bottom:14,width:370,zIndex:2100,
          display:"flex",flexDirection:"column",
          background:"rgba(5,10,22,.97)",
          backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",
          border:"1px solid rgba(34,197,94,.18)",borderRadius:24,overflow:"hidden",
          boxShadow:"0 32px 80px rgba(0,0,0,.85), 0 0 0 .5px rgba(34,197,94,.1) inset",
          fontFamily:"'JetBrains Mono',monospace",
          animation: closing ? "acOut .36s cubic-bezier(.4,0,1,1) forwards"
                             : "acIn .42s cubic-bezier(.34,1.56,.64,1) both",
        }}
      >
        {/* scanline fx */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden",borderRadius:24}}>
          <div style={{position:"absolute",left:0,right:0,height:"20%",
            background:"linear-gradient(transparent,rgba(34,197,94,.025),transparent)",
            animation:"scan 5s linear infinite"}}/>
        </div>

        {/* ── HEADER ── */}
        <div style={{
          position:"relative",zIndex:2,
          display:"flex",alignItems:"center",gap:12,
          padding:"15px 16px 13px",
          borderBottom:"1px solid rgba(34,197,94,.1)",
          background:"rgba(34,197,94,.04)",
        }}>
          <div style={{
            width:40,height:40,borderRadius:14,flexShrink:0,
            background:"linear-gradient(135deg,rgba(34,197,94,.25),rgba(34,197,94,.08))",
            border:"1px solid rgba(34,197,94,.35)",
            display:"flex",alignItems:"center",justifyContent:"center",
            animation:"glow 3s ease-in-out infinite",
          }}>
            <Bot size={20} color="#22c55e"/>
          </div>
          <div style={{flex:1}}>
            <p style={{margin:0,color:"#6ee7a0",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,letterSpacing:".05em"}}>
              MAP INTELLIGENCE
            </p>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e"}}/>
              <span style={{fontSize:9,color:"rgba(34,197,94,.65)",letterSpacing:".07em"}}>
                AGENT ONLINE · AGENTIC MODE
              </span>
            </div>
          </div>
          <button onClick={handleClose} className="ac-ibtn" style={{
            width:30,height:30,borderRadius:9,
            background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",
            color:"rgba(255,255,255,.45)",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s",
          }}><X size={13}/></button>
        </div>

        {/* Live context strip */}
        <LiveContextStrip/>

        {/* ── MESSAGES ── */}
        <div style={{
          flex:1,overflowY:"auto",padding:"12px 12px 6px",
          display:"flex",flexDirection:"column",gap:10,
          position:"relative",zIndex:2,
        }}>
          {msgs.map((m, i) => <MsgBubble key={m.id} msg={m} delay={i*30}/>)}

          {busy && !msgs.find(m=>m.thinking) && (
            <div style={{display:"flex",gap:5,paddingLeft:4}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",
                  animation:`dot 1.2s ease-in-out ${i*.2}s infinite`}}/>
              ))}
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Image preview */}
        {image && (
          <div style={{position:"relative",zIndex:2,margin:"0 12px 6px",borderRadius:10,overflow:"hidden",
            border:"1px solid rgba(34,197,94,.2)",height:72}}>
            <img src={image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <button onClick={()=>setImage(null)} style={{
              position:"absolute",top:5,right:5,width:20,height:20,borderRadius:"50%",
              background:"rgba(0,0,0,.7)",border:"none",color:"white",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}><X size={10}/></button>
          </div>
        )}

        {/* ── INPUT BAR ── */}
        <div style={{position:"relative",zIndex:2,padding:"8px 12px 13px",
          borderTop:"1px solid rgba(34,197,94,.08)",background:"rgba(34,197,94,.02)"}}>

          {/* Quick prompts */}
          <div style={{display:"flex",gap:5,marginBottom:8,overflowX:"auto",paddingBottom:2}}>
            {QUICK.map(q=>(
              <button key={q} onClick={()=>send(q)} className="ac-qbtn" style={{
                padding:"4px 10px",borderRadius:7,flexShrink:0,
                border:"1px solid rgba(34,197,94,.22)",
                background:"rgba(34,197,94,.07)",color:"rgba(34,197,94,.8)",
                fontSize:10,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",
                transition:"background .15s",whiteSpace:"nowrap",
              }}>{q}</button>
            ))}
          </div>

          {/* Input row */}
          <div style={{display:"flex",gap:7,alignItems:"flex-end",
            background:"rgba(255,255,255,.04)",
            border:"1px solid rgba(34,197,94,.18)",borderRadius:13,
            padding:"7px 7px 7px 11px"}}>
            <textarea
              ref={taRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder="Ask the agent anything…"
              rows={1}
              style={{
                flex:1,background:"none",border:"none",outline:"none",
                color:"rgba(255,255,255,.82)",fontSize:12,
                fontFamily:"'JetBrains Mono',monospace",
                resize:"none",maxHeight:90,overflowY:"auto",lineHeight:1.5,
              }}
            />

            {/* image */}
            <input ref={fileRef} type="file" accept="image/*" onChange={onImage} style={{display:"none"}}/>
            <button onClick={()=>fileRef.current?.click()} className="ac-ibtn" style={iconBtnSt}>
              <ImagePlus size={14} color="rgba(255,255,255,.45)"/>
            </button>

            {/* mic */}
            <button onClick={toggleMic} className={recording?"":"ac-ibtn"} style={{
              ...iconBtnSt,
              background:recording?"rgba(34,197,94,.18)":"rgba(255,255,255,.04)",
              border:recording?"1px solid rgba(34,197,94,.45)":"1px solid transparent",
              animation:recording?"glow 1.2s ease-in-out infinite":"none",
            }}>
              {recording
                ? <MicOff size={14} color="#22c55e"/>
                : <Mic size={14} color="rgba(255,255,255,.45)"/>}
            </button>

            {/* send */}
            <button onClick={()=>send()} disabled={busy} className="ac-send" style={{
              width:32,height:32,borderRadius:9,flexShrink:0,border:"none",
              background:busy?"rgba(34,197,94,.2)":"rgba(34,197,94,.88)",
              cursor:busy?"not-allowed":"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"transform .15s,background .15s",
              boxShadow:"0 4px 14px rgba(34,197,94,.38)",
            }}>
              {busy
                ? <Loader size={14} color="white" style={{animation:"spin 1s linear infinite"}}/>
                : <Send size={14} color="white"/>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Live context strip (reads map state) ── */
const LiveContextStrip = () => {
  const [snap, setSnap] = useState<MapStateSnapshot>({ points: [] });
  useEffect(() => {
    const tick = () => setSnap(MapEventBus.getState());
    tick();
    const id = setInterval(tick, 1500);
    return () => clearInterval(id);
  }, []);
  const collected = snap.points.filter(p=>p.status==="collected").length;
  const pending   = snap.points.filter(p=>p.status==="pending").length;

  return (
    <div style={{
      position:"relative",zIndex:2,
      display:"flex",gap:7,padding:"7px 12px",
      borderBottom:"1px solid rgba(255,255,255,.04)",
      overflowX:"auto",
    }}>
      {[
        {label:`${collected} collected`,color:"#22c55e",Icon:CheckCircle},
        {label:`${pending} pending`,    color:"#ef4444",Icon:MapPin},
        {label:`${snap.points.length} total`,color:"rgba(255,255,255,.3)",Icon:Map},
      ].map(({label,color,Icon})=>(
        <div key={label} style={{
          display:"flex",alignItems:"center",gap:5,
          padding:"3px 9px",borderRadius:7,whiteSpace:"nowrap",
          background:`${color}12`,border:`1px solid ${color}28`,
          color,fontSize:9,fontWeight:600,
        }}>
          <Icon size={10}/>{label}
        </div>
      ))}
      <div style={{
        display:"flex",alignItems:"center",gap:5,
        padding:"3px 9px",borderRadius:7,
        background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",
        color:"rgba(255,255,255,.3)",fontSize:9,whiteSpace:"nowrap",
      }}>
        <Zap size={10}/> LIVE
      </div>
    </div>
  );
};

/* ── Message bubble ── */
const MsgBubble = ({ msg, delay: d }: { msg: Msg; delay: number }) => {
  const isAgent = msg.role === "agent";
  return (
    <div style={{
      display:"flex",flexDirection:isAgent?"row":"row-reverse",gap:7,alignItems:"flex-start",
      animation:`msgPop .28s ease ${d}ms both`,
    }}>
      <div style={{
        width:26,height:26,borderRadius:8,flexShrink:0,marginTop:2,
        background:isAgent
          ?"linear-gradient(135deg,rgba(34,197,94,.25),rgba(34,197,94,.08))"
          :"rgba(255,255,255,.06)",
        border:isAgent?"1px solid rgba(34,197,94,.28)":"1px solid rgba(255,255,255,.09)",
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>
        {isAgent?<Bot size={13} color="#22c55e"/>:<User size={13} color="rgba(255,255,255,.55)"/>}
      </div>

      <div style={{maxWidth:"86%",display:"flex",flexDirection:"column",gap:5}}>
        {/* image attachment */}
        {msg.image && (
          <img src={msg.image} alt="" style={{
            width:"100%",maxHeight:130,objectFit:"cover",borderRadius:9,
            border:"1px solid rgba(255,255,255,.09)",
          }}/>
        )}

        {/* thinking dots or step chain */}
        {isAgent && msg.steps && msg.steps.length > 0 && (
          <div style={{
            background:"rgba(34,197,94,.04)",border:"1px solid rgba(34,197,94,.1)",
            borderRadius:9,padding:"7px 9px",display:"flex",flexDirection:"column",gap:3,
          }}>
            {msg.thinking
              ? (
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",
                      animation:`dot 1.2s ease-in-out ${i*.2}s infinite`}}/>
                  ))}
                  <span style={{fontSize:10,color:"rgba(34,197,94,.5)",marginLeft:4}}>Agent thinking…</span>
                </div>
              )
              : msg.steps.map((s,i)=>(
                <div key={s.id} style={{
                  display:"flex",alignItems:"center",gap:6,
                  fontSize:9,color:"rgba(34,197,94,.6)",
                  animation:`stepIn .22s ease ${i*70}ms both`,
                }}>
                  <span style={{color:"#22c55e"}}>✓</span>{s.label}
                </div>
              ))
            }
          </div>
        )}

        {/* command chips */}
        {isAgent && msg.commands && msg.commands.length > 0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
            {msg.commands.map((c,i)=>(
              <span key={i} style={{
                padding:"2px 7px",borderRadius:5,
                background:"rgba(34,197,94,.09)",border:"1px solid rgba(34,197,94,.18)",
                color:"rgba(34,197,94,.65)",fontSize:8,fontWeight:600,letterSpacing:".05em",
              }}>⚡ {c.type.replace(/_/g," ").toUpperCase()}</span>
            ))}
          </div>
        )}

        {/* text */}
        {!!msg.text && (
          <div
            className="ac-msg"
            style={{
              padding:"9px 11px",
              borderRadius:isAgent?"4px 13px 13px 13px":"13px 4px 13px 13px",
              background:isAgent?"rgba(255,255,255,.055)":"rgba(34,197,94,.13)",
              border:isAgent?"1px solid rgba(255,255,255,.07)":"1px solid rgba(34,197,94,.22)",
              color:"rgba(255,255,255,.83)",fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap",
            }}
            dangerouslySetInnerHTML={{__html:
              msg.text
                .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
                .replace(/\*(.*?)\*/g,"<em>$1</em>")
            }}
          />
        )}

        <span style={{
          fontSize:8,color:"rgba(255,255,255,.18)",
          textAlign:isAgent?"left":"right",letterSpacing:".04em",
        }}>
          {msg.ts.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
        </span>
      </div>
    </div>
  );
};

const iconBtnSt: React.CSSProperties = {
  width:30,height:30,borderRadius:8,flexShrink:0,
  background:"rgba(255,255,255,.04)",border:"1px solid transparent",
  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
  transition:"background .15s",
};