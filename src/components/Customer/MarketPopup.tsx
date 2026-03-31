import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_EMOJI } from '../../constants/constants';
import type { MarketPoint } from '../../types/MarketPoint';



interface MarketPopupProps {
  point: MarketPoint;
  origin: { x: number; y: number };
  onClose: () => void;
  onBuy: () => void;
}

const MarketPopup: React.FC<MarketPopupProps> = ({ point, origin, onClose, onBuy }) => {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [animating, setAnim]  = useState(false);
  const [dir, setDir]         = useState<"left" | "right" | null>(null);

  const imgs  = point.images ?? [];
  const color =  CATEGORY_COLORS[point.category] ||  "#22c55e";
  const emoji =  CATEGORY_EMOJI[point.category] || "📦";

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const close = () => { 
    setClosing(true); 
    setTimeout(onClose, 320); 
  };

  const go = (d: "left" | "right") => {
    if (animating) return;
    setDir(d); 
    setAnim(true);
    setTimeout(() => {
      setIdx(i => d === "right" ? (i + 1) % imgs.length : (i - 1 + imgs.length) % imgs.length);
      setDir(null); 
      setAnim(false);
    }, 260);
  };

  const arSt = (direction: "left" | "right"): React.CSSProperties => ({
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    [direction]: 8, width: 28, height: 28, borderRadius: "50%",
    background: "rgba(0,0,0,.42)", backdropFilter: "blur(6px)",
    border: "none", color: "white", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  });

  const W = 300;
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = origin.x + 32, top = origin.y - 200;
  
  if (left + W > vw - 16) left = origin.x - W - 32;
  if (top < 16)           top  = 16;
  if (top + 420 > vh - 16) top = vh - 436;

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: "fixed", left, top, width: W, zIndex: 3000,
        borderRadius: 20, overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        boxShadow: "0 24px 60px rgba(0,0,0,.18), 0 0 0 1.5px rgba(255,255,255,.9)",
        transform:  visible && !closing ? "scale(1)" : "scale(0.6)",
        opacity:    visible && !closing ? 1 : 0,
        transition: "transform .35s cubic-bezier(.34,1.56,.64,1), opacity .28s",
        transformOrigin: `${origin.x < left + W / 2 ? "left" : "right"} center`,
      }}
    >
      {/* Image Section */}
      <div style={{ position: "relative", height: 185, background: "#f1f5f9", overflow: "hidden" }}>
        {imgs.length > 0 ? (
          <img src={imgs[idx].url} alt="" style={{
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform .26s ease, opacity .26s ease",
            transform: animating ? (dir === "right" ? "translateX(-6%) scale(.97)" : "translateX(6%) scale(.97)") : "none",
            opacity: animating ? 0 : 1,
          }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40,
          }}>
            {emoji}
          </div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom,rgba(0,0,0,.14) 0%,transparent 38%,rgba(0,0,0,.4) 100%)",
          pointerEvents: "none",
        }} />

        {/* Category badge */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          padding: "4px 10px", borderRadius: 8,
          background: `${color}ee`, color: "white",
          fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
        }}>
          {emoji} {point.category}
        </div>

        {/* Close */}
        <button onClick={close} style={{
          position: "absolute", top: 10, right: 10,
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(0,0,0,.42)", backdropFilter: "blur(6px)",
          border: "none", color: "white", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><X size={12} /></button>

        {/* Dots */}
        {imgs.length > 1 && (
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
            {imgs.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 16 : 6, height: 6, borderRadius: 3,
                background: i === idx ? "white" : "rgba(255,255,255,.5)",
                cursor: "pointer", transition: "width .22s",
              }} />
            ))}
          </div>
        )}

        {/* Arrows */}
        {imgs.length > 1 && (
          <>
            <button onClick={() => go("left")}  style={arSt("left")}><ChevronLeft size={15} /></button>
            <button onClick={() => go("right")} style={arSt("right")}><ChevronRight size={15} /></button>
          </>
        )}
      </div>

      {/* Content Section */}
      <div style={{ background: "white", padding: "14px 15px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <p style={{ margin: "0 0 3px", fontWeight: 800, fontSize: 13, color: "#111827", lineHeight: 1.3 }}>
            {point.label}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.45 }}>
            {point.description || "Aucune description"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            flex: 1, padding: "10px 11px", borderRadius: 11,
            background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: ".05em" }}>QUANTITÉ</p>
            <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, color: "#374151" }}>
              {point.fixedWeight}
              <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}> {point.weightUnit}</span>
            </p>
          </div>
          <div style={{
            flex: 1, padding: "10px 11px", borderRadius: 11,
            background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: ".05em" }}>PRIX</p>
            <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, color: "#15803d" }}>
              {point.fixedPrice?.toLocaleString()}
              <span style={{ fontSize: 10, fontWeight: 500, color: "#4ade80" }}> {point.currency}</span>
            </p>
          </div>
        </div>

        <button onClick={onBuy} style={{
          width: "100%", padding: "13px", borderRadius: 13, border: "none",
          background: "linear-gradient(135deg,#22c55e,#16a34a)",
          color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 4px 16px rgba(34,197,94,.38)",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          transition: "transform .15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <ShoppingCart size={15} />
          Proposer — {point.fixedPrice?.toLocaleString()} {point.currency}
        </button>
      </div>
    </div>
  );
};

export default MarketPopup;