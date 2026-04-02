import { useEffect, useRef, useState, useCallback } from "react";
import {  Loader, RefreshCw } from "lucide-react";
import { MapEventBus } from "./AgentChat";
import type { ApiDeposit, GarbagePoint, Status } from "../types/ManagerMap";
import { GarbagePopup } from "../components/Manager/GarbagePopup";
import { fetchUncollected, fetchDepositDetail, collectDeposit } from "../services/ManagerService";


declare global { interface Window { L: any } }

export function toPoint(d: ApiDeposit): GarbagePoint {
  return {
    id:     d.id,
    lat:    parseFloat(d.latitude)  || 0,
    lng:    parseFloat(d.longitude) || 0,
    label:  d.description?.trim() || `Dépôt #${d.id}`,
    status: "pending", 
    images: d.image_url
      ? [{ id: 1, url: d.image_url }]
      : d.image
        ? [{ id: 1, url: d.image }]
        : [],
  };
}

const CLR: Record<Status, string> = { collected: "#22c55e", pending: "#ef4444" };


/* ─── AgentRing — UNCHANGED ─────────────────── */
const AgentRing = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <div style={{
    position: "fixed", left: x - 22, top: y - 22,
    width: 44, height: 44, borderRadius: "50%",
    border: `2px solid ${color}`,
    boxShadow: `0 0 0 3px ${color}44, 0 0 20px ${color}88`,
    pointerEvents: "none", zIndex: 1800,
    animation: "agentRing 1.4s ease-out forwards",
  }} />
);

/* ─── AgentToast — UNCHANGED ────────────────── */
const AgentToast = ({ msg }: { msg: string }) => (
  <div style={{
    position: "absolute", bottom: 72, left: "50%", transform: "translateX(-50%)",
    background: "rgba(5,10,22,.92)", backdropFilter: "blur(16px)",
    border: "1px solid rgba(34,197,94,.28)", borderRadius: 11,
    padding: "8px 16px", color: "rgba(255,255,255,.88)",
    fontSize: 11, fontWeight: 600, zIndex: 1300,
    whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(0,0,0,.5)",
    fontFamily: "'JetBrains Mono',monospace",
    animation: "toastIn .22s ease both",
  }}>
    {msg}
  </div>
);

/* ─── Main ───────────────────────────────────── */
export const ManagerMap = () => {
  const mapRef      = useRef<HTMLDivElement>(null);
  const leafletRef  = useRef<any>(null);
  const markersRef  = useRef<Record<number, any>>({});

  /* ── CHANGED: start empty, fill from API ── */
  const [points, setPoints]       = useState<GarbagePoint[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchErr] = useState<string | null>(null);

  const [popup, setPopup]         = useState<{ point: GarbagePoint; origin: { x: number; y: number } } | null>(null);
  const [leafletReady, setReady]  = useState(!!window.L);

  /* agent visual layer — UNCHANGED */
  const [rings, setRings]   = useState<{ id: string; x: number; y: number; color: string }[]>([]);
  const [toast, setToast]   = useState<string | null>(null);
  const pointsRef           = useRef<GarbagePoint[]>(points);
  pointsRef.current         = points;

  /* ── Fetch from backend ── */
  const loadPoints = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    try {
      const pts = await fetchUncollected();
      setPoints(pts);
      /* auto-fit map to loaded points */
      const map = leafletRef.current;
      if (map && window.L && pts.length > 0) {
        const valid = pts.filter(p => p.lat !== 0 && p.lng !== 0);
        if (valid.length > 0) {
          const bounds = window.L.latLngBounds(valid.map(p => [p.lat, p.lng]));
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
        }
      }
    } catch (err: any) {
      setFetchErr(err?.message ?? "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPoints(); }, [loadPoints]);

  /* inject Leaflet — UNCHANGED */
  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  /* build map once — UNCHANGED */
  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [48.857, 2.352], zoom: 14, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO", maxZoom: 19,
    }).addTo(map);
    leafletRef.current = map;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes ripple    { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.6);opacity:0} }
      @keyframes agentRing { 0%{transform:scale(.4);opacity:1} 70%{transform:scale(2.8);opacity:.5} 100%{transform:scale(3.4);opacity:0} }
      @keyframes toastIn   { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    `;
    document.head.appendChild(style);

    return () => { map.remove(); leafletRef.current = null; };
  }, [leafletReady]);

  /* sync markers — UNCHANGED */
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    points.forEach(pt => {
      const color = CLR[pt.status];
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer">
            <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:${color}22;animation:ripple 2.2s ease-out infinite;"></div>
            <div style="width:17px;height:17px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,.9);box-shadow:0 0 0 4px ${color}44;position:relative;z-index:2;transition:transform .2s;"></div>
          </div>`,
        iconSize: [44, 44], iconAnchor: [22, 22],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon }).addTo(map);
      marker.on("click", async (e: any) => {
        e.originalEvent.stopPropagation();
        const cp   = map.latLngToContainerPoint([pt.lat, pt.lng]);
        const rect = mapRef.current!.getBoundingClientRect();
        const origin = { x: rect.left + cp.x, y: rect.top + cp.y };

        // Open popup immediately with cached data, then refresh from API
        setPoints(prev => {
          const cached = prev.find(p => p.id === pt.id)!;
          setPopup({ point: cached, origin });
          return prev;
        });

        // Fetch fresh detail from GET /deposits/{id}/ and update popup
        try {
          const fresh = await fetchDepositDetail(pt.id);
          setPopup(prev => prev?.point.id === pt.id
            ? { ...prev, point: fresh }
            : prev
          );
          // Also sync into points array
          setPoints(prev => prev.map(p => p.id === pt.id ? fresh : p));
        } catch {
          // Keep cached data on fetch error — popup already open
        }
      });
      markersRef.current[pt.id] = marker;
    });
  }, [points, leafletReady]);

  /* toggle status — calls POST /deposits/{id}/collect/ on backend */
  const handleToggle = async (id: number) => {
    const pt = pointsRef.current.find(p => p.id === id);
    if (!pt) return;

    // Only "Mark as Collected" hits the API — pending → collected
    if (pt.status === "pending") {
      // Optimistic UI update immediately
      setPoints(prev => prev.map(p => p.id === id ? { ...p, status: "collected" } : p));
      setPopup(prev => prev?.point.id === id
        ? { ...prev, point: { ...prev.point, status: "collected" } }
        : prev
      );
      flashRing(id, "#22c55e");

      try {
        await collectDeposit(id);
        showToast(`✅ Dépôt #${id} marqué collecté`);
        // Remove from map after short delay (it's now collected, list shows only pending)
        setTimeout(() => {
          setPoints(prev => prev.filter(p => p.id !== id));
          setPopup(prev => prev?.point.id === id ? null : prev);
        }, 1200);
      } catch (err: any) {
        // Rollback on error
        setPoints(prev => prev.map(p => p.id === id ? { ...p, status: "pending" } : p));
        setPopup(prev => prev?.point.id === id
          ? { ...prev, point: { ...prev.point, status: "pending" } }
          : prev
        );
        showToast(`⚠️ ${err.message ?? "Erreur lors de la collecte"}`);
      }
    } else {
      // collected → pending: local toggle only (no "uncollect" endpoint)
      setPoints(prev => prev.map(p => p.id === id ? { ...p, status: "pending" } : p));
      setPopup(prev => prev?.point.id === id
        ? { ...prev, point: { ...prev.point, status: "pending" } }
        : prev
      );
    }
  };

  /* flash ring — UNCHANGED */
  const flashRing = useCallback((ptId: number, color: string) => {
    const map = leafletRef.current;
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
    setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    MapEventBus.registerStateProvider(() => ({
      points: pointsRef.current.map(p => ({
        id: p.id, label: p.label, status: p.status, lat: p.lat, lng: p.lng,
      })),
    }));
  }, []);

  useEffect(() => {
    const unsub = MapEventBus.onCommand((cmd) => {
      const map = leafletRef.current;
      switch (cmd.type) {
        case "collect":
          setPoints(prev => prev.map(p => p.id === cmd.pointId ? { ...p, status: "collected" } : p));
          setPopup(prev => prev?.point.id === cmd.pointId ? { ...prev, point: { ...prev.point, status: "collected" } } : prev);
          flashRing(cmd.pointId, "#22c55e");
          break;
        case "uncollect":
          setPoints(prev => prev.map(p => p.id === cmd.pointId ? { ...p, status: "pending" } : p));
          flashRing(cmd.pointId, "#ef4444");
          break;
        case "highlight":
          flashRing(cmd.pointId, "#facc15");
          break;
        case "highlight_all_pending":
          pointsRef.current.filter(p => p.status === "pending").forEach((p, i) => {
            setTimeout(() => flashRing(p.id, "#ef4444"), i * 200);
          });
          showToast("🔴 Highlighting all pending points");
          break;
        case "highlight_all_collected":
          pointsRef.current.filter(p => p.status === "collected").forEach((p, i) => {
            setTimeout(() => flashRing(p.id, "#22c55e"), i * 200);
          });
          showToast("🟢 Highlighting all collected points");
          break;
        case "fly_to":
          if (map) {
            map.flyTo([cmd.lat, cmd.lng], 16, { animate: true, duration: 1.3 });
            showToast("🗺️ Flying to location…");
          }
          break;
        case "clear_highlights":
          setRings([]);
          showToast("Map highlights cleared");
          break;
        case "show_stats":
          showToast("📊 Stats refreshed");
          break;
      }
    });
    return unsub;
  }, [flashRing, showToast]);

  const collected = points.filter(p => p.status === "collected").length;
  const pending   = points.filter(p => p.status === "pending").length;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }} onClick={() => setPopup(null)}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", background: "#0a0f1e" }} />

      {/* Agent visual rings — UNCHANGED */}
      {rings.map(r => <AgentRing key={r.id} x={r.x} y={r.y} color={r.color} />)}

      {/* Agent toast — UNCHANGED */}
      {toast && <AgentToast msg={toast} />}

      {/* ── Loading overlay ── */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1500,
          background: "rgba(10,15,30,.72)", backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <Loader size={30} color="#22c55e" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0, color: "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 600 }}>
            Chargement des dépôts…
          </p>
        </div>
      )}

      {/* ── Error banner ── */}
      {fetchError && !loading && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", zIndex: 1400,
          background: "rgba(8,15,30,.92)", backdropFilter: "blur(14px)",
          border: "1px solid rgba(239,68,68,.35)", borderRadius: 16,
          padding: "20px 24px", textAlign: "center", maxWidth: 280,
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#f87171" }}>
            ⚠️ Erreur de chargement
          </p>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,.45)" }}>
            {fetchError}
          </p>
          <button
            onClick={loadPoints}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10, border: "none",
              background: "rgba(34,197,94,.85)", color: "#fff",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}
          >
            <RefreshCw size={13} /> Réessayer
          </button>
        </div>
      )}

      {!loading && !fetchError && points.length === 0 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", zIndex: 500,
          background: "rgba(8,15,30,.82)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,.09)", borderRadius: 16,
          padding: "20px 28px", color: "white", textAlign: "center",
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>✅ Aucun dépôt en attente</p>
          <p style={{ margin: 0, fontSize: 12, opacity: .5 }}>Tous les dépôts ont été collectés.</p>
        </div>
      )}

      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 1000,
        background: "rgba(8,15,30,.82)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,.09)", borderRadius: 16,
        padding: "12px 18px", color: "white", display: "flex", gap: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,.4)",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 9, opacity: .45, fontWeight: 700, letterSpacing: 1.2 }}>COLLECTED</p>
          <p style={{ margin: "3px 0 0", fontSize: 22, fontWeight: 800, color: "#22c55e" }}>
            {collected}<span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 400 }}> pts</span>
          </p>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,.07)" }} />
        <div>
          <p style={{ margin: 0, fontSize: 9, opacity: .45, fontWeight: 700, letterSpacing: 1.2 }}>PENDING</p>
          <p style={{ margin: "3px 0 0", fontSize: 22, fontWeight: 800, color: "#ef4444" }}>
            {pending}<span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 400 }}> pts</span>
          </p>
        </div>
        {/* Refresh */}
        <button
          onClick={loadPoints}
          title="Rafraîchir"
          style={{
            alignSelf: "center",
            background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 8, color: "rgba(255,255,255,.5)", cursor: "pointer",
            padding: "5px 7px", display: "flex", alignItems: "center",
            transition: "background .18s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.14)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)"}
        >
          <RefreshCw size={13} style={loading ? { animation: "spin 1s linear infinite" } : undefined} />
        </button>
      </div>

      <div style={{
        position: "absolute", top: 16, right: 16, zIndex: 1000,
        background: "rgba(8,15,30,.82)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,.09)", borderRadius: 14,
        padding: "12px 16px", color: "white", fontSize: 12,
        display: "flex", flexDirection: "column", gap: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,.4)",
      }}>
        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, opacity: .4 }}>LEGEND</p>
        {(Object.entries(CLR) as [Status, string][]).map(([s, c]) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: c, boxShadow: `0 0 7px ${c}` }} />
            <span style={{ textTransform: "capitalize", opacity: .75 }}>{s}</span>
          </div>
        ))}
      </div>

      {popup && (
        <GarbagePopup
          key={popup.point.id}
          point={popup.point}
          origin={popup.origin}
          onClose={() => setPopup(null)}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
};