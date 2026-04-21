import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  MapPin,
  Trash2,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import type { GarbagePoint } from "../../types/ManagerMap";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
  const [idx, setIdx] = useState(0);
  const [animating, setAnim] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgs = point.images;
  const isCollected = point.status === "collected";

  useGSAP(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.6, y: 20, filter: "blur(10px)" },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.45,
        ease: "back.out(1.7)",
      },
    );
  }, []);

  const handleClose = useCallback(() => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.8,
      y: 15,
      filter: "blur(8px)",
      duration: 0.3,
      ease: "power2.in",
      onComplete: onClose,
    });
  }, [onClose]);

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
    }, 280);
  };

  const W = 300,
    H = 420;
  const vw = window.innerWidth,
    vh = window.innerHeight;
  let left = origin.x + 28;
  let top = origin.y - H / 2;
  if (left + W > vw - 12) left = origin.x - W - 28;
  if (top < 12) top = 12;
  if (top + H > vh - 12) top = vh - H - 12;

  const originSide = origin.x < left + W / 2 ? "left" : "right";

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-3000 rounded-[2.5rem] bg-slate-950 shadow-2xl overflow-hidden border border-white/5"
      style={{
        left,
        top,
        width: W,
        height: H,
        transformOrigin: `${originSide} center`,
      }}
    >
      {/* Visual Header / Media */}
      <div className="relative h-[220px] bg-slate-900 overflow-hidden group">
        {imgs.length > 0 ? (
          <img
            src={imgs[idx].url}
            alt={point.label}
            className={`w-full h-full object-cover transition-all duration-300 ${
              animating
                ? direction === "right"
                  ? "-translate-x-6 scale-95 opacity-0"
                  : "translate-x-6 scale-95 opacity-0"
                : "translate-x-0 scale-100 opacity-100"
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-3">
            <Trash2 size={48} className="opacity-20" />
            <span className="text-[10px] font-black tracking-widest uppercase opacity-40">
              Sans média
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-black/40 pointer-events-none" />

        {/* HUD Elements */}
        <div className="absolute top-5 inset-x-5 flex justify-between items-center">
          <div className="flex gap-2">
            {imgs.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? "w-8 bg-brand-green" : "w-2 bg-white/20"}`}
              />
            ))}
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-950/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 active:scale-90 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav Overlays */}
        {imgs.length > 1 && (
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => go("left")}
              className="w-10 h-10 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-white hover:bg-brand-green/20 hover:border-brand-green/30 transition-all font-bold"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => go("right")}
              className="w-10 h-10 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-white hover:bg-brand-green/20 hover:border-brand-green/30 transition-all font-bold"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute bottom-4 left-5">
          <div
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-lg border ${
              isCollected
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-orange-500/20 text-orange-400 border-orange-500/30"
            }`}
          >
            {isCollected ? "Collecté" : "En attente"}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 flex flex-col h-[200px] justify-between">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-brand-green mt-0.5 shrink-0" />
            <div className="overflow-hidden">
              <h4 className="text-white font-black text-sm leading-tight truncate">
                {point.label}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                LAT: {point.lat.toFixed(4)} / LNG: {point.lng.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full" />

          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
            Analyse de l'image suggère un volume de type{" "}
            {point.label.split(" ")[0] || "ménager"}. Prêt pour traitement
            logistique immédiat.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onToggle(point.id)}
          className={`group relative flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
            ${
              isCollected
                ? "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
                : "bg-brand-green text-slate-950 hover:shadow-brand-green/20 shadow-xl"
            }
          `}
        >
          {isCollected ? (
            <>
              <RotateCcw
                size={16}
                className="group-hover:-rotate-45 transition-transform"
              />{" "}
              Rétablir
            </>
          ) : (
            <>
              <CheckCircle
                size={16}
                className="group-hover:scale-125 transition-transform"
              />{" "}
              Valider Collecte
            </>
          )}
        </button>
      </div>
    </div>
  );
};
