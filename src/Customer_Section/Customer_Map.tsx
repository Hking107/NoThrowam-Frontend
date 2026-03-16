import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ShoppingCart, CreditCard, Smartphone, CheckCircle, Loader, RefreshCw } from "lucide-react";
import { MapEventBus, PurchaseBus } from "./Customeragentchat";

declare global { interface Window { L: any } }

/* ─── API Types ──────────────────────────────── */
type WastePost = {
  id: number;
  seller: number;
  title: string;
  description: string;
  sorted: boolean;
  category: number;
  price: number;
  image: string | null;
  image_url: string | null;
  quantity: string;
  unit: string;
  latitude: string;
  longitude: string;
  status: string;
  rejection_reason: string | null;
  paid: boolean;
  reserved_by: number | null;
  reserved_until: string | null;
  ai_state: string;
  ai_payload: string | null;
  ai_error: string | null;
  created_at: string;
  updated_at: string;
};

/* ─── Internal MarketPoint ───────────────────── */
type MarketPoint = {
  id: number;
  lat: number;
  lng: number;
  label: string;
  category: string;
  description: string;
  fixedPrice: number;
  fixedWeight: number;
  weightUnit: string;
  currency: string;
  images: { id: number; url: string }[];
};

/* ─── Category mapping ───────────────────────── */
// Categories come as numeric IDs from the API — we map them to labels/colors
const CATEGORY_LABEL: Record<number, string> = {
  1: "Plastique",
  2: "Métal",
  3: "Carton",
  4: "Verre",
  5: "Textile",
};
const CATEGORY_COLORS: Record<string, string> = {
  Plastique: "#22c55e",
  Métal:     "#3b82f6",
  Carton:    "#f59e0b",
  Verre:     "#06b6d4",
  Textile:   "#a855f7",
  Autre:     "#94a3b8",
};
const CATEGORY_EMOJI: Record<string, string> = {
  Plastique: "♻️", Métal: "🔩", Carton: "📦", Verre: "🫙", Textile: "🧵", Autre: "🗑️",
};

function toMarketPoint(p: WastePost): MarketPoint {
  const cat = CATEGORY_LABEL[p.category] || "Autre";
  const imgs: { id: number; url: string }[] = [];
  if (p.image_url) imgs.push({ id: 1, url: p.image_url });
  else if (p.image) imgs.push({ id: 1, url: p.image });

  return {
    id:          p.id,
    lat:         parseFloat(p.latitude)  || 0,
    lng:         parseFloat(p.longitude) || 0,
    label:       p.title?.trim() || `Post #${p.id}`,
    category:    cat,
    description: p.description?.trim() || "",
    fixedPrice:  p.price ?? 0,
    fixedWeight: parseFloat(p.quantity) || 0,
    weightUnit:  p.unit?.trim() || "kg",
    currency:    "FCFA",
    images:      imgs,   // always an array, never undefined
  };
}

const BASE = "";   // same-origin via Vite proxy; swap to absolute URL if needed

async function fetchWastePosts(): Promise<MarketPoint[]> {
  const res = await fetch(`/api/v0/waste-posts/`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      "ngrok-skip-browser-warning": "69420",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: WastePost[] = await res.json();
  return data
    .filter(p => p.status === "PUBLISHED" && p.latitude && p.longitude)
    .map(toMarketPoint)
    .filter(p => p.lat !== 0 && p.lng !== 0);
}

async function createProposal(postId: number): Promise<{ alreadyExists: boolean }> {
  const res = await fetch(`/api/v0/proposals/waste-posts/${postId}/create/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      "ngrok-skip-browser-warning": "69420",
    },
  });
  if (res.status === 200) return { alreadyExists: true };
  if (res.status === 201) return { alreadyExists: false };
  const err = await res.json().catch(() => ({}));
  throw new Error((err as any)?.detail || `HTTP ${res.status}`);
}

/* ─── Payment Panel ──────────────────────────── */
type PaymentPhase = "choose" | "processing" | "done" | "error";

const PaymentPanel = ({
  point, onClose, onComplete,
}: {
  point: MarketPoint;
  onClose: () => void;
  onComplete: (method: string, txRef: string) => void;
}) => {
  const [phase, setPhase]     = useState<PaymentPhase>("choose");
  const [method, setMethod]   = useState<string | null>(null);
  const [txRef, setTxRef]     = useState("");
  const [errMsg, setErrMsg]   = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handlePay = async (m: string) => {
    setMethod(m);
    setPhase("processing");
    try {
      const { alreadyExists } = await createProposal(point.id);
      const ref = alreadyExists
        ? "PROP-EXIST"
        : "PROP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      setTxRef(ref);
      setPhase("done");
      PurchaseBus.setState({ phase: "done", txRef: ref });
      onComplete(m, ref);
    } catch (e: any) {
      setErrMsg(e?.message ?? "Erreur inconnue");
      setPhase("error");
    }
  };

  const methods = [
    { id: "card",   label: "Carte Bancaire", icon: CreditCard, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { id: "momo",   label: "MTN MoMo",       icon: Smartphone, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    { id: "orange", label: "Orange Money",   icon: Smartphone, color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 4000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)",
      }}
      onClick={phase === "choose" ? onClose : undefined}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 390, background: "white", borderRadius: 24, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,.25)",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          transform: visible ? "scale(1)" : "scale(0.88)",
          opacity:   visible ? 1 : 0,
          transition: "transform .35s cubic-bezier(.34,1.56,.64,1), opacity .25s",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
          padding: "20px 22px 16px",
          borderBottom: "1px solid rgba(34,197,94,.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#15803d" }}>Proposer un achat</span>
            {phase === "choose" && (
              <button onClick={onClose} style={{
                width: 28, height: 28, borderRadius: 8, border: "none",
                background: "rgba(0,0,0,.06)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
              }}><X size={13} /></button>
            )}
          </div>

          {/* Lot summary */}
          <div style={{
            background: "white", borderRadius: 14, padding: "14px 16px",
            border: "1px solid rgba(34,197,94,.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{CATEGORY_EMOJI[point.category] || "📦"}</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}>{point.label}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{point.description}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, padding: "10px 12px", borderRadius: 11,
                background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center",
              }}>
                <p style={{ margin: 0, fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: ".05em" }}>QUANTITÉ</p>
                <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "#374151" }}>
                  {point.fixedWeight}
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}> {point.weightUnit}</span>
                </p>
              </div>
              <div style={{
                flex: 1, padding: "10px 12px", borderRadius: 11,
                background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "center",
              }}>
                <p style={{ margin: 0, fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: ".05em" }}>PRIX</p>
                <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "#15803d" }}>
                  {point.fixedPrice.toLocaleString()}
                  <span style={{ fontSize: 10, fontWeight: 500, color: "#4ade80" }}> {point.currency}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 22px" }}>
          {phase === "choose" && (
            <>
              <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Choisir le mode de paiement
              </p>
              <p style={{ margin: "0 0 14px", fontSize: 11, color: "#94a3b8" }}>
                Une proposition PENDING sera créée et le vendeur sera notifié.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {methods.map(m => (
                  <button key={m.id} onClick={() => handlePay(m.id)} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 14,
                    border: `1.5px solid ${m.border}`,
                    background: m.bg, cursor: "pointer",
                    transition: "transform .15s",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    textAlign: "left",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 11, background: m.color, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <m.icon size={18} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: m.color }}>{m.label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Paiement instantané et sécurisé</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: m.color }}>
                        {point.fixedPrice.toLocaleString()}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{point.currency}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === "processing" && (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                border: "3px solid rgba(34,197,94,.15)",
                borderTop: "3px solid #22c55e",
                animation: "custSpin 1s linear infinite",
                margin: "0 auto 18px",
              }} />
              <p style={{ margin: 0, fontWeight: 700, color: "#15803d", fontSize: 15 }}>Création de la proposition…</p>
              <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 12 }}>
                {methods.find(m => m.id === method)?.label}
              </p>
              <style>{`@keyframes custSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {phase === "done" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 68, height: 68, borderRadius: "50%",
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 28px rgba(34,197,94,.38)",
              }}>
                <CheckCircle size={32} color="white" />
              </div>
              <p style={{ margin: "0 0 8px", fontWeight: 800, color: "#15803d", fontSize: 17 }}>
                {txRef === "PROP-EXIST" ? "Proposition déjà existante" : "Proposition envoyée !"}
              </p>
              <div style={{
                display: "inline-block", padding: "6px 16px", borderRadius: 8,
                background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 14,
              }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Réf : </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#15803d", letterSpacing: ".05em" }}>
                  {txRef}
                </span>
              </div>
              <p style={{ margin: "0 0 22px", fontSize: 12, color: "#64748b", lineHeight: 1.65 }}>
                {txRef === "PROP-EXIST"
                  ? "Vous avez déjà une proposition en cours pour ce lot."
                  : "Le vendeur a été notifié. Votre proposition est en attente de confirmation."
                }
              </p>
              <button onClick={onClose} style={{
                padding: "12px 32px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(34,197,94,.38)",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}>Terminer</button>
            </div>
          )}

          {phase === "error" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 68, height: 68, borderRadius: "50%",
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 28px rgba(239,68,68,.38)",
              }}>
                <X size={32} color="white" />
              </div>
              <p style={{ margin: "0 0 8px", fontWeight: 800, color: "#dc2626", fontSize: 17 }}>
                Erreur
              </p>
              <p style={{ margin: "0 0 22px", fontSize: 12, color: "#64748b" }}>{errMsg}</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => setPhase("choose")} style={{
                  padding: "10px 20px", borderRadius: 12, border: "1.5px solid #e2e8f0",
                  background: "white", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}>Réessayer</button>
                <button onClick={onClose} style={{
                  padding: "10px 20px", borderRadius: 12, border: "none",
                  background: "#ef4444", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}>Fermer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Market Popup ───────────────────────────── */
const MarketPopup = ({
  point, origin, onClose, onBuy,
}: {
  point: MarketPoint;
  origin: { x: number; y: number };
  onClose: () => void;
  onBuy: () => void;
}) => {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [animating, setAnim]  = useState(false);
  const [dir, setDir]         = useState<"left" | "right" | null>(null);

  const imgs  = point.images ?? [];
  const color = CATEGORY_COLORS[point.category] || "#22c55e";

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const close = () => { setClosing(true); setTimeout(onClose, 320); };

  const go = (d: "left" | "right") => {
    if (animating) return;
    setDir(d); setAnim(true);
    setTimeout(() => {
      setIdx(i => d === "right" ? (i + 1) % imgs.length : (i - 1 + imgs.length) % imgs.length);
      setDir(null); setAnim(false);
    }, 260);
  };

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
      {/* Image */}
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
            {CATEGORY_EMOJI[point.category] || "📦"}
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
          {CATEGORY_EMOJI[point.category]} {point.category}
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

        {imgs.length > 1 && (
          <>
            <button onClick={() => go("left")}  style={arSt("left")}><ChevronLeft size={15} /></button>
            <button onClick={() => go("right")} style={arSt("right")}><ChevronRight size={15} /></button>
          </>
        )}
      </div>

      {/* Content */}
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
              {point.fixedPrice.toLocaleString()}
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
          Proposer — {point.fixedPrice.toLocaleString()} {point.currency}
        </button>
      </div>
    </div>
  );
};

const arSt = (side: "left" | "right"): React.CSSProperties => ({
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  ...(side === "left" ? { left: 8 } : { right: 8 }),
  zIndex: 10,
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 30, height: 30,
  background: "rgba(0,0,0,.35)", backdropFilter: "blur(6px)",
  border: "1px solid rgba(255,255,255,.3)", borderRadius: "50%",
  color: "white", cursor: "pointer",
});

const CustToast = ({ msg }: { msg: string }) => (
  <div style={{
    position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
    background: "rgba(255,255,255,.96)", backdropFilter: "blur(16px)",
    border: "1px solid rgba(34,197,94,.25)", borderRadius: 12,
    padding: "9px 18px", color: "#15803d",
    fontSize: 12, fontWeight: 700, zIndex: 1300,
    whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(0,0,0,.1)",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    animation: "toastIn .22s ease both",
  }}>{msg}</div>
);

const Ring = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <div style={{
    position: "fixed", left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: "50%",
    border: `2px solid ${color}`,
    boxShadow: `0 0 0 3px ${color}44, 0 0 18px ${color}66`,
    pointerEvents: "none", zIndex: 1800,
    animation: "ringOut 1.4s ease-out forwards",
  }} />
);

/* ─── Main Map ───────────────────────────────── */
export const CustomerMap = () => {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafRef    = useRef<any>(null);
  const markersRef = useRef<Record<number, any>>({});
  const pointsRef  = useRef<MarketPoint[]>([]);

  const [points, setPoints]       = useState<MarketPoint[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchErr] = useState<string | null>(null);

  const [popup, setPopup]     = useState<{ point: MarketPoint; origin: { x: number; y: number } } | null>(null);
  const [payment, setPayment] = useState<MarketPoint | null>(null);
  const [leafReady, setLeaf]  = useState(!!window.L);
  const [rings, setRings]     = useState<{ id: string; x: number; y: number; color: string }[]>([]);
  const [toast, setToast]     = useState<string | null>(null);

  pointsRef.current = points;

  /* ── Fetch posts ── */
  const loadPoints = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    try {
      const pts = await fetchWastePosts();
      setPoints(pts);
      const map = leafRef.current;
      if (map && window.L && pts.length > 0) {
        const bounds = window.L.latLngBounds(pts.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      }
    } catch (e: any) {
      setFetchErr(e?.message ?? "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPoints(); }, [loadPoints]);

  /* ── Load Leaflet ── */
  useEffect(() => {
    if (window.L) { setLeaf(true); return; }
    const link = document.createElement("link");
    link.rel   = "stylesheet";
    link.href  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const s  = document.createElement("script");
    s.src    = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = () => setLeaf(true);
    document.head.appendChild(s);
  }, []);

  /* ── Init map ── */
  useEffect(() => {
    if (!leafReady || !mapRef.current || leafRef.current) return;
    const L   = window.L;
    const map = L.map(mapRef.current, { center: [3.848, 11.502], zoom: 13, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO", maxZoom: 19,
    }).addTo(map);
    leafRef.current = map;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes ripple2{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.8);opacity:0}}
      @keyframes ringOut{0%{transform:scale(.4);opacity:1}70%{transform:scale(2.6);opacity:.5}100%{transform:scale(3.2);opacity:0}}
      @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    `;
    document.head.appendChild(style);

    return () => { map.remove(); leafRef.current = null; };
  }, [leafReady]);

  /* ── Sync markers ── */
  useEffect(() => {
    const map = leafRef.current;
    if (!map || !window.L) return;
    const L = window.L;
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    points.forEach(pt => {
      const color = CATEGORY_COLORS[pt.category] || "#94a3b8";
      const icon  = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:56px;height:56px;display:flex;align-items:center;justify-content:center;cursor:pointer">
            <div style="position:absolute;width:38px;height:38px;border-radius:50%;background:${color}22;animation:ripple2 2.4s ease-out infinite;"></div>
            <div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 3px 14px ${color}77,0 1px 4px rgba(0,0,0,.15);position:relative;z-index:2;"></div>
          </div>`,
        iconSize: [56, 56], iconAnchor: [28, 28],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon }).addTo(map);
      marker.on("click", (e: any) => {
        e.originalEvent.stopPropagation();
        const cp   = map.latLngToContainerPoint([pt.lat, pt.lng]);
        const rect = mapRef.current!.getBoundingClientRect();
        const current = pointsRef.current.find(p => p.id === pt.id)!;
        setPopup({ point: current, origin: { x: rect.left + cp.x, y: rect.top + cp.y } });
      });
      markersRef.current[pt.id] = marker;
    });
  }, [points, leafReady]);

  /* ── State provider for agent ── */
  useEffect(() => {
    MapEventBus.registerStateProvider(() => ({
      points: pointsRef.current.map(p => ({
        id: p.id, label: p.label, category: p.category, lat: p.lat, lng: p.lng,
        fixedPrice: p.fixedPrice, currency: p.currency, fixedWeight: p.fixedWeight,
      })),
      cart: [],
    }));
  }, []);

  const flashRing = useCallback((ptId: number, color: string) => {
    const map = leafRef.current;
    if (!map || !mapRef.current) return;
    const pt = pointsRef.current.find(p => p.id === ptId);
    if (!pt) return;
    const cp   = map.latLngToContainerPoint([pt.lat, pt.lng]);
    const rect = mapRef.current.getBoundingClientRect();
    const rid  = Date.now().toString() + ptId;
    setRings(r => [...r, { id: rid, x: rect.left + cp.x, y: rect.top + cp.y, color }]);
    setTimeout(() => setRings(r => r.filter(x => x.id !== rid)), 1500);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  /* ── Bus commands ── */
  useEffect(() => {
    const unsub = MapEventBus.onCommand(cmd => {
      const map = leafRef.current;
      switch (cmd.type) {
        case "highlight":
          flashRing(cmd.pointId, "#22c55e");
          break;
        case "highlight_all_available":
          pointsRef.current.forEach((p, i) => {
            setTimeout(() => flashRing(p.id, CATEGORY_COLORS[p.category] || "#22c55e"), i * 180);
          });
          showToast("🛒 Tous les lots disponibles mis en évidence");
          break;
        case "fly_to":
          if (map) map.flyTo([cmd.lat, cmd.lng], 16, { animate: true, duration: 1.3 });
          break;
        case "open_purchase": {
          const pt = pointsRef.current.find(p => p.id === cmd.pointId);
          if (pt) { setPopup(null); setPayment(pt); }
          break;
        }
        case "clear_highlights":
          setRings([]);
          break;
        case "show_cart":
          showToast("🛒 Panier mis à jour");
          break;
      }
    });
    return unsub;
  }, [flashRing, showToast]);

  const handleBuy = () => {
    if (!popup) return;
    PurchaseBus.setState({ phase: "selecting", pointId: popup.point.id, qty: 1 });
    setPayment(popup.point);
    setPopup(null);
  };

  const totalWeight = points.reduce((s, p) => s + p.fixedWeight, 0);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%", background: "#f8fafc" }}
      onClick={() => setPopup(null)}
    >
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {rings.map(r => <Ring key={r.id} x={r.x} y={r.y} color={r.color} />)}
      {toast && <CustToast msg={toast} />}

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1500,
          background: "rgba(248,250,252,.8)", backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <Loader size={28} color="#22c55e" style={{ animation: "custSpin 1s linear infinite" }} />
          <p style={{ margin: 0, color: "#64748b", fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Chargement des lots…
          </p>
          <style>{`@keyframes custSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Error banner */}
      {fetchError && !loading && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", zIndex: 1400,
          background: "white", borderRadius: 16,
          border: "1px solid rgba(239,68,68,.25)",
          padding: "20px 24px", textAlign: "center", maxWidth: 280,
          boxShadow: "0 8px 32px rgba(0,0,0,.1)",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#ef4444" }}>⚠️ Erreur de chargement</p>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#94a3b8" }}>{fetchError}</p>
          <button onClick={loadPoints} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 10, border: "none",
            background: "#22c55e", color: "#fff",
            fontWeight: 700, fontSize: 12, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
          }}>
            <RefreshCw size={13} /> Réessayer
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && points.length === 0 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", zIndex: 500,
          background: "white", borderRadius: 16,
          border: "1px solid rgba(34,197,94,.15)",
          padding: "20px 28px", textAlign: "center",
          boxShadow: "0 6px 24px rgba(0,0,0,.08)",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#374151" }}>Aucun lot disponible</p>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Revenez plus tard pour de nouvelles offres.</p>
        </div>
      )}

      {/* Stats badge */}
      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 1000,
        background: "rgba(255,255,255,.95)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(34,197,94,.15)", borderRadius: 18,
        padding: "12px 18px", display: "flex", gap: 20, alignItems: "center",
        boxShadow: "0 6px 24px rgba(0,0,0,.08)",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: 1.2 }}>LOTS</p>
          <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: "#22c55e" }}>
            {points.length}<span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}> lots</span>
          </p>
        </div>
        <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch" }} />
        <div>
          <p style={{ margin: 0, fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: 1.2 }}>TOTAL</p>
          <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: "#6366f1" }}>
            {totalWeight.toFixed(0)}<span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}> kg</span>
          </p>
        </div>
        <button onClick={loadPoints} title="Rafraîchir" style={{
          alignSelf: "center",
          background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.2)",
          borderRadius: 8, color: "#22c55e", cursor: "pointer",
          padding: "5px 7px", display: "flex", alignItems: "center",
          transition: "background .18s",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,.16)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,.08)"}
        >
          <RefreshCw size={13} style={loading ? { animation: "custSpin 1s linear infinite" } : undefined} />
        </button>
      </div>

      {/* Category legend */}
      <div style={{
        position: "absolute", top: 16, right: 16, zIndex: 1000,
        background: "rgba(255,255,255,.95)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(0,0,0,.07)", borderRadius: 16,
        padding: "12px 16px", display: "flex", flexDirection: "column", gap: 7,
        boxShadow: "0 6px 24px rgba(0,0,0,.08)",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}>
        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: 1.2 }}>CATÉGORIES</p>
        {Object.entries(CATEGORY_COLORS).filter(([c]) => c !== "Autre").map(([cat, color]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}88` }} />
            <span style={{ fontSize: 11, color: "#374151", fontWeight: 500 }}>
              {CATEGORY_EMOJI[cat]} {cat}
            </span>
          </div>
        ))}
      </div>

      {popup && (
        <MarketPopup
          key={popup.point.id}
          point={popup.point}
          origin={popup.origin}
          onClose={() => setPopup(null)}
          onBuy={handleBuy}
        />
      )}

      {payment && (
        <PaymentPanel
          point={payment}
          onClose={() => setPayment(null)}
          onComplete={() => { setTimeout(() => setPayment(null), 3500); }}
        />
      )}
    </div>
  );
};