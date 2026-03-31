import React from 'react';
import { Bot, User, CheckCircle } from 'lucide-react';
import type { Msg } from '../../types/AIMessage';

interface CustMsgBubbleProps {
  msg: Msg;
  delay: number;
}

const CustMsgBubble: React.FC<CustMsgBubbleProps> = ({ msg, delay: d }) => {
  const isAgent = msg.role === "agent";
  
  return (
    <div style={{
      display: "flex", flexDirection: isAgent ? "row" : "row-reverse", gap: 7, alignItems: "flex-start",
      animation: `msgPop .28s ease ${d}ms both`,
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: 9, flexShrink: 0, marginTop: 2,
        background: isAgent ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(0,0,0,.05)",
        border: isAgent ? "none" : "1px solid rgba(0,0,0,.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: isAgent ? "0 3px 10px rgba(34,197,94,.3)" : "none",
      }}>
        {isAgent ? <Bot size={13} color="white"/> : <User size={13} color="#64748b"/>}
      </div>

      <div style={{ maxWidth: "86%", display: "flex", flexDirection: "column", gap: 5 }}>
        
        {/* Thinking Steps / System Messages */}
        {isAgent && msg.steps && msg.steps.length > 0 && (
          <div style={{
            background: "rgba(240,253,244,.8)", border: "1px solid rgba(34,197,94,.15)",
            borderRadius: 10, padding: "7px 10px", display: "flex", flexDirection: "column", gap: 3,
          }}>
            {msg.thinking ? (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: "50%", background: "#22c55e",
                    animation: `dot 1.2s ease-in-out ${i * .2}s infinite`
                  }}/>
                ))}
                <span style={{ fontSize: 10, color: "#4ade80", marginLeft: 4, fontWeight: 600 }}>Thinking…</span>
              </div>
            ) : msg.steps.map((s: any, i: number) => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 10, color: "#4ade80",
                animation: `stepIn .22s ease ${i * 70}ms both`,
                fontWeight: 600,
              }}>
                <CheckCircle size={9}/>{s.label}
              </div>
            ))}
          </div>
        )}

        {/* Commands / Action tags */}
        {isAgent && msg.commands && msg.commands.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {msg.commands.map((c: any, i: number) => (
              <span key={i} style={{
                padding: "2px 8px", borderRadius: 5,
                background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)",
                color: "#16a34a", fontSize: 9, fontWeight: 700, letterSpacing: ".04em",
              }}>⚡ {c.type.replace(/_/g, " ").toUpperCase()}</span>
            ))}
          </div>
        )}

        {/* Actual Message Text */}
        {!!msg.text && (
          <div
            className="cac-msg"
            style={{
              padding: "10px 12px",
              borderRadius: isAgent ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
              background: isAgent ? "white" : "rgba(34,197,94,.12)",
              border: isAgent ? "1px solid rgba(0,0,0,.07)" : "1px solid rgba(34,197,94,.2)",
              color: isAgent ? "#1e293b" : "#15803d",
              fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap",
              boxShadow: isAgent ? "0 2px 8px rgba(0,0,0,.06)" : "none",
            }}
            dangerouslySetInnerHTML={{
              __html: msg.text
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>")
            }}
          />
        )}

        {/* Timestamp */}
        <span style={{ fontSize: 9, color: "#94a3b8", textAlign: isAgent ? "left" : "right", fontWeight: 500 }}>
          {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default CustMsgBubble;