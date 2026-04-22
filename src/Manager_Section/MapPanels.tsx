import { RefreshCw } from "lucide-react";
import { CLR } from "./constants";

// ── Stats panel (bottom-left) ─────────────────────────────────────────────────
interface StatsPanelProps {
  statsRef:       React.RefObject<HTMLDivElement | null>;
  collectedCount: number;
  pendingCount:   number;
  loading:        boolean;
  onRefresh:      () => void;
}

export const StatsPanel = ({
  statsRef, collectedCount, pendingCount, loading, onRefresh,
}: StatsPanelProps) => (
  <div
    ref={statsRef}
    className="
      absolute bottom-6 left-6 z-[1000] opacity-0
      bg-white/90 backdrop-blur-xl border border-brand-green/15
      rounded-xl p-5 shadow-2xl shadow-black/5
      flex items-center gap-8
    "
  >
    <div>
      <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mb-1">Collectés</p>
      <p className="text-2xl font-black text-brand-green leading-none">
        {collectedCount}
        <span className="text-[10px] text-slate-300 font-bold ml-1 uppercase">pts</span>
      </p>
    </div>

    <div className="w-px h-10 bg-slate-200/50" />

    <div>
      <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mb-1">Non collectés</p>
      <p className="text-2xl font-black text-red-500 leading-none">
        {pendingCount}
        <span className="text-[10px] text-slate-300 font-bold ml-1 uppercase">pts</span>
      </p>
    </div>

    <button
      onClick={onRefresh}
      className="
        w-10 h-10 rounded-lg flex items-center justify-center
        bg-brand-green/5 border border-brand-green/10 text-brand-green
        hover:bg-brand-green hover:text-white transition-all active:scale-90
      "
    >
      <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
    </button>
  </div>
);

// ── Legend panel (top-left) ───────────────────────────────────────────────────
interface LegendPanelProps {
  legendRef: React.RefObject<HTMLDivElement | null>;
}

export const LegendPanel = ({ legendRef }: LegendPanelProps) => (
  <div
    ref={legendRef}
    className="
      absolute top-4 left-4 z-[1000] opacity-0
      bg-white/90 backdrop-blur-xl border border-slate-200/50
      rounded-xl p-5 shadow-2xl shadow-black/5 flex flex-col gap-3
    "
  >
    <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mb-1">Légende</p>

    {(["collected", "pending"] as const).map((status) => (
      <div key={status} className="flex items-center gap-3 group">
        <div
          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
          style={{ background: CLR[status], boxShadow: `0 0 8px ${CLR[status]}88` }}
        />
        <span className="text-sm text-slate-600 font-semibold tracking-tight group-hover:text-slate-900 transition-colors">
          {status === "collected" ? "Collecté" : "Non collecté"}
        </span>
      </div>
    ))}
  </div>
);
