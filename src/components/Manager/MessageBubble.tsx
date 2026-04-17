import { Bot, User, CheckCircle2, Zap } from "lucide-react";
import type { Msg } from "../../types/ManagerAgentChat";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const MsgBubble = ({ msg, delay: d }: { msg: Msg; delay: number }) => {
  const isAgent = msg.role === "agent";
  const bubbleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(bubbleRef.current,
      { opacity: 0, y: 10, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, delay: d / 1000, ease: "out" }
    );
  }, [msg.id]);

  return (
    <div 
      ref={bubbleRef}
      className={`flex gap-3 items-start ${isAgent ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-500
        ${isAgent 
          ? "bg-brand-green/10 border-brand-green/20 text-brand-green shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
          : "bg-white/5 border-white/10 text-slate-400"
        }`}
      >
        {isAgent ? <Bot size={16} /> : <User size={16} />}
      </div>

      <div className={`max-w-[85%] flex flex-col gap-2 ${isAgent ? "items-start" : "items-end"}`}>
        {/* Attachment */}
        {msg.image && (
          <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img 
              src={msg.image} 
              alt="Uploaded context" 
              className="max-h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
          </div>
        )}

        {/* Steps / Thinking */}
        {isAgent && msg.steps && msg.steps.length > 0 && (
          <div className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl p-3 space-y-2">
            {msg.thinking ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div 
                      key={i} 
                      className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">Séquençage neural…</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {msg.steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 opacity-0 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}>
                    <CheckCircle2 size={10} className="text-brand-green" />
                    <span className="text-[9px] font-bold text-brand-green/60 uppercase tracking-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Commands */}
        {isAgent && msg.commands && msg.commands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {msg.commands.map((c, i) => (
              <div 
                key={i} 
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-green/10 border border-brand-green/20 text-[8px] font-black text-brand-green uppercase tracking-widest"
              >
                <Zap size={8} fill="currentColor" />
                {c.type.replace(/_/g, " ")}
              </div>
            ))}
          </div>
        )}

        {/* Text Body */}
        {msg.text && (
          <div
            className={`px-4 py-3 text-sm leading-relaxed font-medium break-words
              ${isAgent 
                ? "bg-slate-900/40 border border-white/5 text-slate-200 rounded-2xl rounded-tl-none" 
                : "bg-brand-green text-slate-950 border border-brand-green/20 rounded-2xl rounded-tr-none shadow-lg shadow-brand-green/10"
              }`}
            dangerouslySetInnerHTML={{
              __html: msg.text
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-green font-black">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="opacity-70 italic">$1</em>')
            }}
          />
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
            {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isAgent && <div className="w-1 h-1 rounded-full bg-brand-green animate-pulse" />}
        </div>
      </div>
    </div>
  );
};

