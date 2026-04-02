import { Bot, User } from "lucide-react";
import type { Msg } from "../../types/ManagerAgentChat";

export const MsgBubble = ({ msg, delay: d }: { msg: Msg; delay: number }) => {
  const isAgent = msg.role === "agent";
  return (
    <div style={{
      display:"flex",flexDirection:isAgent?"row":"row-reverse",gap:7,alignItems:"flex-start",
      animation:`msgPop .28s ease ${d}ms both`,
    }}>
      <div style={{
        width:26,height:26,borderRadius:8,flexShrink:0,marginTop:2,
        background:isAgent?"linear-gradient(135deg,rgba(34,197,94,.25),rgba(34,197,94,.08))":"rgba(255,255,255,.06)",
        border:isAgent?"1px solid rgba(34,197,94,.28)":"1px solid rgba(255,255,255,.09)",
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>
        {isAgent?<Bot size={13} color="#22c55e"/>:<User size={13} color="rgba(255,255,255,.55)"/>}
      </div>

      <div style={{maxWidth:"86%",display:"flex",flexDirection:"column",gap:5}}>
        {msg.image && (
          <img src={msg.image} alt="" style={{
            width:"100%",maxHeight:130,objectFit:"cover",borderRadius:9,
            border:"1px solid rgba(255,255,255,.09)",
          }}/>
        )}

        {isAgent && msg.steps && msg.steps.length > 0 && (
          <div style={{
            background:"rgba(34,197,94,.04)",border:"1px solid rgba(34,197,94,.1)",
            borderRadius:9,padding:"7px 9px",display:"flex",flexDirection:"column",gap:3,
          }}>
            {msg.thinking ? (
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",
                    animation:`dot 1.2s ease-in-out ${i*.2}s infinite`}}/>
                ))}
                <span style={{fontSize:10,color:"rgba(34,197,94,.5)",marginLeft:4}}>Agent thinking…</span>
              </div>
            ) : msg.steps.map((s,i)=>(
              <div key={s.id} style={{
                display:"flex",alignItems:"center",gap:6,
                fontSize:9,color:"rgba(34,197,94,.6)",
                animation:`stepIn .22s ease ${i*70}ms both`,
              }}>
                <span style={{color:"#22c55e"}}>✓</span>{s.label}
              </div>
            ))}
          </div>
        )}

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
