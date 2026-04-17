import { useEffect, useRef, useState, useCallback } from "react";
import {  Loader, RefreshCw } from "lucide-react";
import { MapEventBus } from "./AgentChat";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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


const AgentRing = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <div 
    className="fixed pointer-events-none z-[1800] rounded-full border-2"
    style={{ 
      left: x - 22, top: y - 22, width: 44, height: 44, 
      borderColor: color,
      boxShadow: `0 0 0 3px ${color}44, 0 0 20px ${color}88`,
      animation: "agentRing 1.4s ease-out forwards"
    }} 
  />
);

const AgentToast = ({ msg }: { msg: string }) => (
  <div className="fixed bottom-18 left-1/2 -translate-x-1/2 z-[1300] px-4 py-2
                  bg-slate-950/90 backdrop-blur-xl border border-brand-green/30 rounded-xl
                  shadow-2xl shadow-black/50 text-white font-mono text-[11px] font-semibold
                  flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
    {msg}
  </div>
);

export const ManagerMap = () => {
  const mapRef      = useRef<HTMLDivElement>(null);
  const leafletRef  = useRef<any>(null);
  const markersRef  = useRef<Record<number, any>>({});
  
  const uiRefs = {
    stats: useRef<HTMLDivElement>(null),
    legend: useRef<HTMLDivElement>(null),
  };

  const [points, setPoints]       = useState<GarbagePoint[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchErr] = useState<string | null>(null);

  const [popup, setPopup]         = useState<{ point: GarbagePoint; origin: { x: number; y: number } } | null>(null);
  const [leafletReady, setReady]  = useState(!!window.L);

  const [rings, setRings]   = useState<{ id: string; x: number; y: number; color: string }[]>([]);
  const [toast, setToast]   = useState<string | null>(null);
  const pointsRef           = useRef<GarbagePoint[]>(points);
  pointsRef.current         = points;

  useGSAP(() => {
    if (!loading && !fetchError) {
      gsap.fromTo([uiRefs.stats.current, uiRefs.legend.current],
        { opacity: 0, scale: 0.95, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "expo.out", delay: 0.3 }
      );
    }
  }, [loading, fetchError]);

  const loadPoints = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    try {
      const pts = await fetchUncollected();
      setPoints(pts);
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

  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [3.848, 11.502], zoom: 14, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO", maxZoom: 19,
    }).addTo(map);
    leafletRef.current = map;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes ripple    { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.6);opacity:0} }
      @keyframes agentRing { 0%{transform:scale(.4);opacity:1} 70%{transform:scale(2.8);opacity:.5} 100%{transform:scale(3.4);opacity:0} }
    `;
    document.head.appendChild(style);

    return () => { map.remove(); leafletRef.current = null; };
  }, [leafletReady]);

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

        setPoints(prev => {
          const cached = prev.find(p => p.id === pt.id)!;
          setPopup({ point: cached, origin });
          return prev;
        });

        try {
          const fresh = await fetchDepositDetail(pt.id);
          setPopup(prev => prev?.point.id === pt.id
            ? { ...prev, point: fresh }
            : prev
          );
          setPoints(prev => prev.map(p => p.id === pt.id ? fresh : p));
        } catch {
        }
      });
      markersRef.current[pt.id] = marker;
    });
  }, [points, leafletReady]);

  const handleToggle = async (id: number) => {
    const pt = pointsRef.current.find(p => p.id === id);
    if (!pt) return;

    if (pt.status === "pending") {
      setPoints(prev => prev.map(p => p.id === id ? { ...p, status: "collected" } : p));
      setPopup(prev => prev?.point.id === id
        ? { ...prev, point: { ...prev.point, status: "collected" } }
        : prev
      );
      flashRing(id, "#22c55e");

      try {
        await collectDeposit(id);
        showToast(`✅ Dépôt #${id} marqué collecté`);
        setTimeout(() => {
          setPoints(prev => prev.filter(p => p.id !== id));
          setPopup(prev => prev?.point.id === id ? null : prev);
        }, 1200);
      } catch (err: any) {
        setPoints(prev => prev.map(p => p.id === id ? { ...p, status: "pending" } : p));
        setPopup(prev => prev?.point.id === id
          ? { ...prev, point: { ...prev.point, status: "pending" } }
          : prev
        );
        showToast(`⚠️ ${err.message ?? "Erreur lors de la collecte"}`);
      }
    } else {
      setPoints(prev => prev.map(p => p.id === id ? { ...p, status: "pending" } : p));
      setPopup(prev => prev?.point.id === id
        ? { ...prev, point: { ...prev.point, status: "pending" } }
        : prev
      );
    }
  };

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
    <div className="relative w-full h-full bg-slate-950" onClick={() => setPopup(null)}>
      <div ref={mapRef} className="w-full h-full grayscale opacity-80 contrast-[1.1]" />

      {rings.map(r => <AgentRing key={r.id} x={r.x} y={r.y} color={r.color} />)}
      {toast && <AgentToast msg={toast} />}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1500] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <Loader size={32} className="text-brand-green animate-spin" />
          <p className="text-slate-400 font-bold tracking-tight">Analyse des flux…</p>
        </div>
      )}

      {/* Error banner */}
      {fetchError && !loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1400] 
                        bg-slate-900/95 backdrop-blur-xl p-8 rounded-3xl border border-red-500/30 
                        shadow-2xl shadow-red-500/10 text-center max-w-xs animate-in zoom-in duration-300">
          <p className="text-3xl mb-4">🚨</p>
          <p className="text-lg font-black text-white mb-2">Erreur système</p>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed font-mono">{fetchError}</p>
          <button onClick={loadPoints} className="w-full py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95">
             Réinitialiser la connexion
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && points.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] 
                        bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-brand-green/20 
                        shadow-2xl shadow-black/50 text-center animate-in fade-in zoom-in duration-500">
          <div className="text-4xl mb-4">🛰️</div>
          <p className="text-xl font-black text-white mb-1 leading-tight">Secteur Nettoyé</p>
          <p className="text-slate-500 text-sm leading-relaxed">Aucun dépôt en attente de collecte.</p>
        </div>
      )}

      {/* Stats overlay */}
      {!loading && !fetchError && (
        <div 
          ref={uiRefs.stats}
          className="absolute top-6 left-6 z-[1000] bg-slate-900/80 backdrop-blur-xl border border-white/10 
                     rounded-3xl p-5 flex gap-8 items-center shadow-2xl shadow-black/40 opacity-0 -translate-y-2"
        >
          <div>
            <p className="text-[9px] text-white/30 font-black tracking-widest uppercase mb-1">Collectés</p>
            <p className="text-2xl font-black text-brand-green leading-none">
              {collected}<span className="text-[10px] text-white/20 font-bold ml-1 uppercase">pts</span>
            </p>
          </div>
          <div className="w-px h-10 bg-white/5" />
          <div>
            <p className="text-[9px] text-white/30 font-black tracking-widest uppercase mb-1">En attente</p>
            <p className="text-2xl font-black text-red-500 leading-none">
              {pending}<span className="text-[10px] text-white/20 font-bold ml-1 uppercase">pts</span>
            </p>
          </div>
          <button 
            onClick={loadPoints} 
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center
                       text-white/40 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      )}

      {/* Legend overlay */}
      {!loading && !fetchError && (
        <div 
          ref={uiRefs.legend}
          className="absolute top-6 right-6 z-[1000] bg-slate-900/80 backdrop-blur-xl border border-white/10 
                     rounded-2xl p-4 flex flex-col gap-3 shadow-2xl shadow-black/40 opacity-0 -translate-y-2"
        >
          <p className="text-[9px] text-white/30 font-black tracking-widest uppercase mb-1">Légende</p>
          {(Object.entries(CLR) as [Status, string][]).map(([s, c]) => (
            <div key={s} className="flex items-center gap-4 group">
              <div 
                className="w-2.5 h-2.5 rounded-full transition-shadow duration-300"
                style={{ background: c, boxShadow: `0 0 10px ${c}` }} 
              />
              <span className="text-xs text-white/60 font-medium capitalize tracking-wide group-hover:text-white transition-colors">
                {s}
              </span>
            </div>
          ))}
        </div>
      )}

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