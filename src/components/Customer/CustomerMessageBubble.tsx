import React, { useRef } from 'react';
import { Bot, User, CheckCircle, Zap } from 'lucide-react';
import type { Msg } from '../../types/AIMessage';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CustMsgBubbleProps {
  msg: Msg;
  delay: number;
}

const CustMsgBubble: React.FC<CustMsgBubbleProps> = ({ msg, delay: d }) => {
  const isAgent = msg.role === "agent";
  const bubbleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(bubbleRef.current,
      { opacity: 0, x: isAgent ? -15 : 15, scale: 0.96 },
      { opacity: 1, x: 0, scale: 1, duration: 0.4, delay: d / 1000, ease: "back.out(1.4)" }
    );
  }, [msg.id]);
  
  return (
    <div 
      ref={bubbleRef}
      className={`flex gap-3 items-start ${isAgent ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-all duration-300 shadow-sm
        ${isAgent 
          ? "bg-gradient-to-br from-brand-green to-emerald-600 text-white shadow-brand-green/20" 
          : "bg-slate-100 border border-slate-200 text-slate-400"
        }`}
      >
        {isAgent ? <Bot size={18} /> : <User size={18} />}
      </div>

      <div className={`max-w-[85%] flex flex-col gap-2 ${isAgent ? "items-start" : "items-end"}`}>
        
        {/* Thinking Steps / System Messages */}
        {isAgent && msg.steps && msg.steps.length > 0 && (
          <div className="w-full bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 rounded-2xl p-3 space-y-2">
            {msg.thinking ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div 
                      key={i} 
                      className="w-1.5 h-1.5 rounded-full bg-brand-green animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-brand-green tracking-tight uppercase">Récupération des lots…</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {msg.steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 opacity-0 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}>
                    <CheckCircle size={10} className="text-brand-green" />
                    <span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Commands / Action tags */}
        {isAgent && msg.commands && msg.commands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {msg.commands.map((c, i) => (
              <div 
                key={i} 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-700 uppercase tracking-widest shadow-sm"
              >
                <Zap size={10} fill="currentColor" />
                {c.type.replace(/_/g, " ")}
              </div>
            ))}
          </div>
        )}

        {/* Actual Message Text */}
        {msg.text && (
          <div
            className={`px-4 py-3 text-[13px] leading-relaxed font-medium break-words shadow-sm
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

        {/* Timestamp */}
        <div className="flex items-center gap-2 px-1">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isAgent && <div className="w-1 h-1 rounded-full bg-brand-green" />}
        </div>
      </div>
    </div>
  );
};

export default CustMsgBubble;