
// ── Agent ring flash ──────────────────────────────────────────────────────────
export const AgentRing = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <div
    className="fixed pointer-events-none z-[1800] rounded-full border-2"
    style={{
      left: x - 22, top: y - 22, width: 44, height: 44,
      borderColor: color,
      boxShadow:   `0 0 0 3px ${color}44, 0 0 20px ${color}88`,
      animation:   "agentRing 1.4s ease-out forwards",
    }}
  />
);

// ── Toast notification ────────────────────────────────────────────────────────
export const AgentToast = ({ msg }: { msg: string }) => (
  <div className="
    fixed bottom-18 left-1/2 -translate-x-1/2 z-[1300]
    px-4 py-2 flex items-center gap-3
    bg-white/90 backdrop-blur-xl border border-brand-green/20
    rounded-xl shadow-2xl shadow-brand-green/10
    text-brand-green font-mono text-[11px] font-semibold
    animate-in fade-in slide-in-from-bottom-2 duration-300
  ">
    <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
    {msg}
  </div>
);

// ── Loading overlay ───────────────────────────────────────────────────────────
export const LoadingOverlay = () => (
  <div className="absolute inset-0 z-[1500] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
    {/* Inline spinner avoids importing Loader just for this */}
    <svg className="animate-spin text-brand-green" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
    </svg>
    <p className="text-slate-600 font-bold tracking-tight">Analyse des flux…</p>
  </div>
);

// ── Error state ───────────────────────────────────────────────────────────────
export const ErrorOverlay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="
    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1400]
    bg-white/95 backdrop-blur-xl p-8 rounded-xl border border-red-200
    shadow-2xl shadow-red-500/10 text-center max-w-xs animate-in zoom-in duration-300
  ">
    <p className="text-3xl mb-4">🚨</p>
    <p className="text-lg font-black text-slate-800 mb-2">Erreur système</p>
    <p className="text-slate-500 text-sm mb-6 leading-relaxed font-mono">{message}</p>
    <button
      onClick={onRetry}
      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg
                 transition-all shadow-lg shadow-red-500/20 active:scale-95"
    >
      Réinitialiser
    </button>
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyOverlay = () => (
  <div className="
    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500]
    bg-white/90 backdrop-blur-xl p-8 rounded-xl
    border border-brand-green/10 shadow-2xl shadow-brand-green/10
    text-center animate-in fade-in zoom-in duration-500
  ">
    <div className="text-4xl mb-4">🛰️</div>
    <p className="text-xl font-black text-slate-800 mb-1 leading-tight">Secteur Nettoyé</p>
    <p className="text-slate-500 text-sm leading-relaxed">Aucun dépôt en attente de collecte.</p>
  </div>
);
