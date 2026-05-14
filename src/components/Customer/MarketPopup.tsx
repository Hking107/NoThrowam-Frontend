import React, { useState, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Package,
  Info,
} from "lucide-react";
import {
  CATEGORY_COLORS,
  CATEGORY_EMOJI,
} from "../../hooks/constants/constants";
import type { MarketPoint } from "../../types/MarketPoint";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface MarketPopupProps {
  point: MarketPoint;
  origin: { x: number; y: number };
  onClose: () => void;
  onBuy: () => void;
}

const MarketPopup: React.FC<MarketPopupProps> = ({
  point,
  origin,
  onClose,
  onBuy,
}) => {
  const [idx, setIdx] = useState(0);
  const [animating, setAnim] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgs = point.images ?? [];
  const color = CATEGORY_COLORS[point.category] || "#22c55e";
  const emoji = CATEGORY_EMOJI[point.category] || "📦";
  const vw = window.innerWidth;
  const W = Math.min(320, vw - 24);

  useGSAP(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.6, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
    );
  }, []);

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.8,
      y: 10,
      duration: 0.25,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  const go = (d: "left" | "right") => {
    if (animating) return;
    setDirection(d);
    setAnim(true);
    setTimeout(() => {
      setIdx((i) =>
        d === "right"
          ? (i + 1) % imgs.length
          : (i - 1 + imgs.length) % imgs.length,
      );
      setDirection(null);
      setAnim(false);
    }, 260);
  };

  const vh = window.innerHeight;
  let left = origin.x + 32,
    top = origin.y - 180;

  if (vw < 640) {
    left = 12;
    top = Math.max(12, Math.min(top, vh - 452));
  }

  if (left + W > vw - 16) left = origin.x - W - 32;
  if (top < 16) top = 16;
  if (top + 440 > vh - 16) top = vh - 456;

  const originSide = origin.x < left + W / 2 ? "left" : "right";

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-3000 rounded-4xl bg-white shadow-2xl overflow-hidden border border-white/90 max-w-[calc(100vw-1rem)]"
      style={{ left, top, width: W, transformOrigin: `${originSide} center` }}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-slate-100 overflow-hidden group">
        {imgs.length > 0 ? (
          <img
            src={imgs[idx].url}
            alt={point.label}
            className={`w-full h-full object-cover transition-all duration-300 ${
              animating
                ? direction === "right"
                  ? "-translate-x-4 opacity-0"
                  : "translate-x-4 opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {emoji}
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Top Controls */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-start">
          <div
            className="px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase text-white backdrop-blur-md shadow-lg"
            style={{ background: `${color}cc` }}
          >
            {emoji} {point.category}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"
          >
            <X size={14} />
          </button>
        </div>

        {/* Navigation Arrows */}
        {imgs.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => go("left")}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 active:scale-90 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => go("right")}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 active:scale-90 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Carousel Indicators */}
        {imgs.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imgs.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-brand-green" />
            <h3 className="text-base font-black text-slate-900 leading-tight truncate">
              {point.label}
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {point.description ||
              "Un lot de matériaux recyclables prêt pour la collecte. Qualité vérifiée."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">
              Quantité
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xl font-black text-slate-700">
                {point.fixedWeight}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {point.weightUnit}
              </span>
            </div>
          </div>
          <div className="bg-brand-green/5 rounded-2xl p-3 border border-brand-green/10 text-center">
            <p className="text-[9px] font-black text-brand-green tracking-widest uppercase mb-1">
              Estimation
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xl font-black text-brand-green">
                {point.fixedPrice?.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-brand-green/60">
                {point.currency}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onBuy}
          className="w-full h-14 bg-linear-to-br from-brand-green to-emerald-600 rounded-2xl
                     flex items-center justify-center gap-3 text-white font-black text-sm
                     shadow-xl shadow-brand-green/20 hover:shadow-brand-green/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <ShoppingCart size={18} />
          Faire une offre — {point.fixedPrice?.toLocaleString()}{" "}
          {point.currency}
        </button>

        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
          <Info size={12} />
          Paiement sécurisé via EcoMarché
        </div>
      </div>
    </div>
  );
};

export default MarketPopup;
