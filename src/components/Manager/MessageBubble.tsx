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
      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-all duration-500 shadow-sm
        ${isAgent 
          ? "bg-gradient-to-br from-brand-green to-emerald-600 border-none text-white shadow-brand-green/20" 
          : "bg-slate-100 border border-slate-200 text-slate-400"
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
          <div className="w-full bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 rounded-2xl p-3 space-y-2">
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
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-green">Analyzing map context…</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {msg.steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 opacity-0 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}>
                    <CheckCircle2 size={10} className="text-brand-green" />
                    <span className="text-[9px] font-bold text-emerald-800/60 uppercase tracking-tight">{s.label}</span>
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

        {msg.text && (
          <div
            className={`px-4 py-3 text-sm leading-relaxed font-medium break-words shadow-sm
              ${isAgent 
                ? "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none" 
                : "bg-brand-green text-white border border-brand-green/20 rounded-2xl rounded-tr-none shadow-brand-green/10"
              }`}
            dangerouslySetInnerHTML={{
              __html: msg.text
                .replace(/\*\*(.*?)\*\*/g, `<strong class="${isAgent ? 'text-brand-green' : 'text-white'} font-black">$1</strong>`)
                .replace(/\*(.*?)\*/g, '<em class="opacity-80 italic">$1</em>')
            }}
          />
        )}

        <div className="flex items-center gap-2 px-1">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isAgent && <div className="w-1 h-1 rounded-full bg-brand-green animate-pulse" />}
        </div>
      </div>
    </div>
  );
};

