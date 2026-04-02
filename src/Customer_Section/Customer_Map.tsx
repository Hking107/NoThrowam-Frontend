import { useEffect, useRef, useState, useCallback } from "react";
import { Loader, RefreshCw } from "lucide-react";
import { MapEventBus, PurchaseBus } from "./Customeragentchat";

import MarketPopup from "../components/Customer/MarketPopup";
import type { MarketPoint } from "../types/MarketPoint";
import type { WastePost } from "../types/WastePost";
import { CATEGORY_LABEL, CATEGORY_COLORS, CATEGORY_EMOJI } from "../constants/constants";

import PaymentPanel from "../components/Customer/PaymentPanel";


declare global { interface Window { L: any } }



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
    images:      imgs,   
  };
}

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



/* ─── Payment Panel ──────────────────────────── */
type PaymentPhase = "choose" | "processing" | "done" | "error";

// const arSt = (side: "left" | "right"): React.CSSProperties => ({
//   position: "absolute", top: "50%", transform: "translateY(-50%)",
//   ...(side === "left" ? { left: 8 } : { right: 8 }),
//   zIndex: 10,
//   display: "flex", alignItems: "center", justifyContent: "center",
//   width: 30, height: 30,
//   background: "rgba(0,0,0,.35)", backdropFilter: "blur(6px)",
//   border: "1px solid rgba(255,255,255,.3)", borderRadius: "50%",
//   color: "white", cursor: "pointer",
// });

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

export { MapEventBus };
