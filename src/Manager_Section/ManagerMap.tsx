import { useRef, useState, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import type { GarbagePoint } from "../types/ManagerMap";
import { GarbagePopup } from "../components/Manager/GarbagePopup";
import { collectDeposit } from "../services/ManagerService";

import { useManagerMapData } from "./useManagerMapData";
import { useMapLeaflet } from "./useMapLeaflet";
import { useMapMarkers } from "./useMapMarkers";
import { useManagerMapEvents } from "./useManagerMapEvents";
import { AgentRing, AgentToast, LoadingOverlay, ErrorOverlay, EmptyOverlay } from "./MapOverlays";
import { StatsPanel, LegendPanel } from "./MapPanels";

declare global { interface Window { L: any } }

export const ManagerMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<Record<number, any>>({});
  const pointsRef = useRef<GarbagePoint[]>([]);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null);

  const [popup, setPopup] = useState<{ point: GarbagePoint; origin: { x: number; y: number } } | null>(null);
  const [rings, setRings] = useState<{ id: string; x: number; y: number; color: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const { points, setPoints, loading, fetchError, loadPoints } =
    useManagerMapData(leafletRef, mapRef);
  pointsRef.current = points;

  const { leafletReady } = useMapLeaflet(mapRef, leafletRef);

  // ── Visual helpers ──────────────────────────────────────────────────────────
  const flashRing = useCallback((ptId: number, color: string) => {
    const map = leafletRef.current;
    if (!map || !mapRef.current) return;
    const pt = pointsRef.current.find((p) => p.id === ptId);
    if (!pt) return;
    const cp = map.latLngToContainerPoint([pt.lat, pt.lng]);
    const rect = mapRef.current.getBoundingClientRect();
    const rid = `${Date.now()}${ptId}`;
    setRings((r) => [...r, { id: rid, x: rect.left + cp.x, y: rect.top + cp.y, color }]);
    setTimeout(() => setRings((r) => r.filter((x) => x.id !== rid)), 1500);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  }, []);

  useMapMarkers({ points, leafletReady, leafletRef, markersRef, mapDivRef: mapRef, setPoints, setPopup });
  useManagerMapEvents({ pointsRef, leafletRef, setPoints, setPopup, flashRing, showToast });

  // ── Collect toggle ──────────────────────────────────────────────────────────
  const handleToggle = async (id: number) => {
    const pt = pointsRef.current.find((p) => p.id === id);
    if (!pt) return;
    const patch = (status: "collected" | "pending") => {
      setPoints((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
      setPopup((prev) => prev?.point.id === id ? { ...prev, point: { ...prev.point, status } } : prev);
    };
    if (pt.status === "pending") {
      patch("collected");
      flashRing(id, "#007a5e");
      try {
        await collectDeposit(id);
        showToast(`✅ Dépôt #${id} marqué collecté`);
        setTimeout(() => { setPoints((prev) => prev.filter((p) => p.id !== id)); setPopup(null); }, 1200);
      } catch (err: any) {
        patch("pending");
        showToast(`⚠️ ${err.message ?? "Erreur lors de la collecte"}`);
      }
    } else {
      patch("pending");
    }
  };

  // ── GSAP entrance ───────────────────────────────────────────────────────────
  useGSAP(() => {
    if (!loading && !fetchError)
      gsap.fromTo([statsRef.current, legendRef.current],
        { opacity: 0, scale: 0.95, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "expo.out", delay: 0.3 });
  }, [loading, fetchError]);

  const collectedCount = points.filter((p) => p.status === "collected" && p.isValid).length;
  const pendingCount = points.filter((p) => p.status === "pending").length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-slate-50" onClick={() => setPopup(null)}>
      <div ref={mapRef} className="w-full h-full grayscale opacity-80 contrast-[1.1]" />

      {rings.map((r) => <AgentRing key={r.id} x={r.x} y={r.y} color={r.color} />)}
      {toast && <AgentToast msg={toast} />}

      {loading && <LoadingOverlay />}
      {fetchError && !loading && <ErrorOverlay message={fetchError} onRetry={loadPoints} />}
      {!loading && !fetchError && points.length === 0 && <EmptyOverlay />}

      {!loading && !fetchError && (
        <>
          <StatsPanel statsRef={statsRef} collectedCount={collectedCount} pendingCount={pendingCount} loading={loading} onRefresh={loadPoints} />
          <LegendPanel legendRef={legendRef} />
        </>
      )}

      {popup && (
        <GarbagePopup key={popup.point.id} point={popup.point} origin={popup.origin}
          onClose={() => setPopup(null)} onToggle={handleToggle} />
      )}
    </div>
  );
};
