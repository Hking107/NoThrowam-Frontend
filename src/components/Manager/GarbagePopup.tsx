import { X, ChevronLeft, ChevronRight, RotateCcw, CheckCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { GarbagePoint } from "../../types/ManagerMap";

const arrowStyle = (side: "left" | "right"): React.CSSProperties => ({
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  [side]: 10, zIndex: 10,
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 34, height: 34,
  background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,.15)", borderRadius: "50%",
  color: "white", cursor: "pointer",
});

export const GarbagePopup = ({
  point,
  origin,
  onClose,
  onToggle,
}: {
  point: GarbagePoint;
  origin: { x: number; y: number };
  onClose: () => void;
  onToggle: (id: number) => void;
}) => {
  const [idx, setIdx]         = useState(0);
  const [dir, setDir]         = useState<"left" | "right" | null>(null);
  const [animating, setAnim]  = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const imgs = point.images;
  const isCollected = point.status === "collected";

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 350);
  }, [onClose]);

  const go = (d: "left" | "right") => {
    if (animating) return;
    setDir(d);
    setAnim(true);
    setTimeout(() => {
      setIdx(i => d === "right" ? (i + 1) % imgs.length : (i - 1 + imgs.length) % imgs.length);
      setDir(null);
      setAnim(false);
    }, 280);
  };

  const W = 280, H = 400;
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = origin.x + 28;
  let top  = origin.y - H / 2;
  if (left + W > vw - 12) left = origin.x - W - 28;
  if (top < 12)           top  = 12;
  if (top + H > vh - 12)  top  = vh - H - 12;

  const originX = origin.x < left + W / 2 ? "left" : "right";

  const popupStyle: React.CSSProperties = {
    position:      "fixed",
    left, top, width: W, height: H,
    zIndex:        3000,
    borderRadius:  22,
    overflow:      "hidden",
    boxShadow:     "0 24px 64px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.08)",
    transformOrigin: `${originX} center`,
    transition:    closing
      ? "opacity .3s ease, transform .35s cubic-bezier(.4,0,1,1), filter .3s ease"
      : "opacity .35s cubic-bezier(.34,1.56,.64,1), transform .4s cubic-bezier(.34,1.56,.64,1), filter .3s ease",
    opacity:  visible && !closing ? 1 : 0,
    transform: visible && !closing ? "scale(1)" : "scale(0.55)",
    filter:   visible && !closing ? "blur(0px)" : "blur(6px)",
  };

  const imgStyle: React.CSSProperties = {
    position:  "absolute", inset: 0,
    width:     "100%", height: "100%",
    objectFit: "cover", display: "block",
    transition: "transform .28s cubic-bezier(.4,0,.2,1), opacity .28s ease",
    transform: animating
      ? dir === "right" ? "translateX(-8%) scale(.96)" : "translateX(8%) scale(.96)"
      : "translateX(0) scale(1)",
    opacity: animating ? 0 : 1,
  };

  return (
    <div style={popupStyle} onClick={e => e.stopPropagation()}>
      <div style={{ position: "absolute", inset: 0, background: "#0a0f1e" }}>
        {imgs.length > 0 ? (
          <img src={imgs[idx].url} alt="" style={imgStyle} />
        ) : (
          /* No image fallback */
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,.18)", fontSize: 13, fontStyle: "italic",
          }}>
            Aucune image
          </div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,.55) 0%, transparent 35%, transparent 55%, rgba(0,0,0,.72) 100%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px", zIndex: 10,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {imgs.map((_, i) => (
            <button key={i}
              onClick={() => { setDir(i > idx ? "right" : "left"); setIdx(i); }}
              style={{
                width: i === idx ? 18 : 6, height: 6,
                borderRadius: 3, border: "none", cursor: "pointer",
                background: i === idx ? "#fff" : "rgba(255,255,255,.4)",
                transition: "width .25s cubic-bezier(.34,1.56,.64,1), background .2s",
                padding: 0,
              }}
            />
          ))}
        </div>
        <button onClick={close} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 30, height: 30,
          background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,.15)",
          borderRadius: "50%", color: "white", cursor: "pointer", fontSize: 14,
          transition: "background .18s, transform .18s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,.75)"; (e.currentTarget as HTMLElement).style.transform = "scale(1.12)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,.45)"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* arrows */}
      {imgs.length > 1 && (
        <>
          <button onClick={() => go("left")}  style={arrowStyle("left")}><ChevronLeft size={18} /></button>
          <button onClick={() => go("right")} style={arrowStyle("right")}><ChevronRight size={18} /></button>
        </>
      )}

      {/* bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 14px 16px", zIndex: 10,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <p style={{ margin: 0, color: "rgba(255,255,255,.75)", fontSize: 11, fontWeight: 600, letterSpacing: ".02em", textShadow: "0 1px 4px rgba(0,0,0,.8)" }}>
          📍 {point.label}
        </p>
        <button
          onClick={() => onToggle(point.id)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            width: "100%", padding: "11px 0", borderRadius: 14, border: "none",
            cursor: "pointer", fontWeight: 700, fontSize: 13, letterSpacing: ".01em",
            backdropFilter: "blur(12px)",
            transition: "transform .18s cubic-bezier(.34,1.56,.64,1), background .2s, box-shadow .2s",
            background: isCollected ? "rgba(239,68,68,.82)" : "rgba(34,197,94,.82)",
            color: "#fff",
            boxShadow: isCollected ? "0 4px 20px rgba(239,68,68,.5)" : "0 4px 20px rgba(34,197,94,.5)",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
        >
          {isCollected ? <><RotateCcw size={14} /> Mark as Pending</> : <><CheckCircle size={14} /> Mark as Collected</>}
        </button>
      </div>
    </div>
  );
};