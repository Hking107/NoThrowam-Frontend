import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Mic, MicOff, ImagePlus, Bot, User,
  Zap, MapPin, CheckCircle, Loader, Map,
} from "lucide-react";
import type { AgentApiResponse, AgentResult, AgentStep, MapCommand, MapStateSnapshot, Msg } from "../types/ManagerAgentChat";
import { MsgBubble } from "../components/Manager/MessageBubble";

const BUS = {
  _cmdListeners: [] as Array<(cmd: MapCommand) => void>,
  sendCommand(cmd: MapCommand) { this._cmdListeners.forEach(fn => fn(cmd)); },
  onCommand(fn: (cmd: MapCommand) => void) {
    this._cmdListeners.push(fn);
    return () => { this._cmdListeners = this._cmdListeners.filter(f => f !== fn); };
  },
  registerStateProvider(fn: () => MapStateSnapshot) { (window as any).__mapStateProvider = fn; },
  getState(): MapStateSnapshot {
    const p = (window as any).__mapStateProvider;
    return p ? p() : { points: [] };
  },
};
export const MapEventBus = BUS;

/* ─────────────────────────────────────────────────────
   REAL API CALL  →  POST /api/v0/agents/agentic-message/
───────────────────────────────────────────────────── */


function mkStep(label: string): AgentStep {
  return { id: Math.random().toString(36).slice(2), label, done: true };
}

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

  /* ── Derive map commands from action results ── */
  const commands: MapCommand[] = [];

  if (data.mode === "action" && data.results?.length) {
    for (const r of data.results) {
      // Deposit collected → mark on map
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

  /* ── Fallback commands from natural language ── */
  if (commands.length === 0) {
    const lower = data.response.toLowerCase() + " " + message.toLowerCase();
    if (/pending/i.test(lower))   commands.push({ type: "highlight_all_pending" });
    if (/collected/i.test(lower)) commands.push({ type: "highlight_all_collected" });
    if (/stat|report/i.test(lower)) commands.push({ type: "show_stats" });
    if (/clear|reset/i.test(lower)) commands.push({ type: "clear_highlights" });
  }

  const steps: AgentStep[] = [
    mkStep(`Mode: ${data.mode}`),
    mkStep(`Role: ${data.role}`),
    ...(data.results?.length ? [mkStep(`${data.results.length} action(s) executed`)] : []),
  ];

  return { reply: data.response, commands, steps };
}


/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────── */
export const AgentChat = ({ onClose }: { onClose: () => void }) => {
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: "init", role: "agent", ts: new Date(),
    text: "👋 I'm your **Map Intelligence Agent**. I have live access to your map and can take actions in real-time.\n\nTry *\"Show pending points\"*, *\"Mark deposit 3 as collected\"*, or *\"Generate a report\"*.",
  }]);
  const [input, setInput]         = useState("");
  const [image, setImage]         = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy]           = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [closing, setClosing]     = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const mediaRef  = useRef<MediaRecorder | null>(null);

  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true))); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const handleClose = () => { setClosing(true); setTimeout(onClose, 360); };

  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text && !image) return;

    const userMsg: Msg = { id: Date.now().toString(), role: "user", ts: new Date(), text, image: image ?? undefined };
    setMsgs(p => [...p, userMsg]);
    setInput(""); setImage(null); setBusy(true);

    const thinkId = "think_" + Date.now();
    setMsgs(p => [...p, {
      id: thinkId, role: "agent", ts: new Date(), text: "",
      steps: [{ id: "t", label: "Thinking…", done: false }], thinking: true,
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
        ? { ...m, text: `⚠️ ${e?.message ?? "Agent error — please try again."}`, thinking: false,
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
      setTimeout(() => send("Show me all pending collection points"), 350);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new MediaRecorder(stream);
        rec.start(); mediaRef.current = rec; setRecording(true);
        setTimeout(() => { if (mediaRef.current?.state === "recording") toggleMic(); }, 8000);
      } catch { setInput("🎤 Microphone unavailable — type your request."); }
    }
  };

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

      <div onClick={handleClose} style={{
        position:"fixed",inset:0,zIndex:2000,
        background:"rgba(0,0,0,.32)",backdropFilter:"blur(2px)",
        transition:"opacity .36s",opacity:mounted&&!closing?1:0,
      }}/>

      <div className="ac-root" onClick={e=>e.stopPropagation()} style={{
        position:"fixed",top:14,right:14,bottom:14,width:370,zIndex:2100,
        display:"flex",flexDirection:"column",
        background:"rgba(5,10,22,.97)",
        backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",
        border:"1px solid rgba(34,197,94,.18)",borderRadius:24,overflow:"hidden",
        boxShadow:"0 32px 80px rgba(0,0,0,.85), 0 0 0 .5px rgba(34,197,94,.1) inset",
        fontFamily:"'JetBrains Mono',monospace",
        animation:closing?"acOut .36s cubic-bezier(.4,0,1,1) forwards":"acIn .42s cubic-bezier(.34,1.56,.64,1) both",
      }}>
        {/* scanline */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden",borderRadius:24}}>
          <div style={{position:"absolute",left:0,right:0,height:"20%",
            background:"linear-gradient(transparent,rgba(34,197,94,.025),transparent)",
            animation:"scan 5s linear infinite"}}/>
        </div>

        {/* HEADER */}
        <div style={{
          position:"relative",zIndex:2,
          display:"flex",alignItems:"center",gap:12,padding:"15px 16px 13px",
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
              <span style={{fontSize:9,color:"rgba(34,197,94,.65)",letterSpacing:".07em"}}>AGENT ONLINE · AGENTIC MODE</span>
            </div>
          </div>
          <button onClick={handleClose} className="ac-ibtn" style={{
            width:30,height:30,borderRadius:9,
            background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",
            color:"rgba(255,255,255,.45)",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s",
          }}><X size={13}/></button>
        </div>

        <LiveContextStrip/>

        {/* MESSAGES */}
        <div style={{
          flex:1,overflowY:"auto",padding:"12px 12px 6px",
          display:"flex",flexDirection:"column",gap:10,
          position:"relative",zIndex:2,
        }}>
          {msgs.map((m,i) => <MsgBubble key={m.id} msg={m} delay={i*30}/>)}
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

        {/* INPUT BAR */}
        <div style={{position:"relative",zIndex:2,padding:"8px 12px 13px",
          borderTop:"1px solid rgba(34,197,94,.08)",background:"rgba(34,197,94,.02)"}}>
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

          <div style={{display:"flex",gap:7,alignItems:"flex-end",
            background:"rgba(255,255,255,.04)",
            border:"1px solid rgba(34,197,94,.18)",borderRadius:13,
            padding:"7px 7px 7px 11px"}}>
            <textarea
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
            <input ref={fileRef} type="file" accept="image/*" onChange={onImage} style={{display:"none"}}/>
            <button onClick={()=>fileRef.current?.click()} className="ac-ibtn" style={iconBtnSt}>
              <ImagePlus size={14} color="rgba(255,255,255,.45)"/>
            </button>
            <button onClick={toggleMic} className={recording?"":"ac-ibtn"} style={{
              ...iconBtnSt,
              background:recording?"rgba(34,197,94,.18)":"rgba(255,255,255,.04)",
              border:recording?"1px solid rgba(34,197,94,.45)":"1px solid transparent",
              animation:recording?"glow 1.2s ease-in-out infinite":"none",
            }}>
              {recording?<MicOff size={14} color="#22c55e"/>:<Mic size={14} color="rgba(255,255,255,.45)"/>}
            </button>
            <button onClick={()=>send()} disabled={busy} className="ac-send" style={{
              width:32,height:32,borderRadius:9,flexShrink:0,border:"none",
              background:busy?"rgba(34,197,94,.2)":"rgba(34,197,94,.88)",
              cursor:busy?"not-allowed":"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"transform .15s,background .15s",
              boxShadow:"0 4px 14px rgba(34,197,94,.38)",
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
      borderBottom:"1px solid rgba(255,255,255,.04)",overflowX:"auto",
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

const iconBtnSt: React.CSSProperties = {
  width:30,height:30,borderRadius:8,flexShrink:0,
  background:"rgba(255,255,255,.04)",border:"1px solid transparent",
  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
  transition:"background .15s",
};