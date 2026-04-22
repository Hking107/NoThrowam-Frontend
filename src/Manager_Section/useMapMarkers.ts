import { useEffect } from "react";
import type { GarbagePoint } from "../types/ManagerMap";
import { fetchDepositDetail } from "../services/ManagerService";
import { CLR } from "./constants";

interface UseMapMarkersArgs {
  points:      GarbagePoint[];
  leafletReady: boolean;
  leafletRef:  React.MutableRefObject<any>;
  markersRef:  React.MutableRefObject<Record<number, any>>;
  mapDivRef:   React.MutableRefObject<HTMLDivElement | null>;
  setPoints:   React.Dispatch<React.SetStateAction<GarbagePoint[]>>;
  setPopup:    React.Dispatch<React.SetStateAction<any>>;
}

function makeIcon(L: any, color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer">
        <div style="position:absolute;width:32px;height:32px;border-radius:50%;
          background:${color}22;animation:ripple 2.2s ease-out infinite"></div>
        <div style="width:17px;height:17px;border-radius:50%;background:${color};
          border:2.5px solid rgba(255,255,255,.9);box-shadow:0 0 0 4px ${color}44;
          position:relative;z-index:2;transition:transform .2s"></div>
      </div>`,
    iconSize:   [44, 44],
    iconAnchor: [22, 22],
  });
}

export function useMapMarkers({
  points, leafletReady, leafletRef, markersRef, mapDivRef, setPoints, setPopup,
}: UseMapMarkersArgs) {
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    console.log(`Processing ${points.length} points:`, points.map(p => ({ id: p.id, status: p.status, isValid: p.isValid })));
    
    points.filter((pt) => pt.isValid).forEach((pt) => {
      console.log(`Creating marker for point ${pt.id}:`, { status: pt.status, color: CLR[pt.status] });
      const marker = L.marker([pt.lat, pt.lng], { icon: makeIcon(L, CLR[pt.status]) }).addTo(map);

      marker.on("click", async (e: any) => {
        e.originalEvent.stopPropagation();
        const cp     = map.latLngToContainerPoint([pt.lat, pt.lng]);
        const rect   = mapDivRef.current!.getBoundingClientRect();
        const origin = { x: rect.left + cp.x, y: rect.top + cp.y };

        // Show cached version immediately
        setPoints((prev) => {
          const cached = prev.find((p) => p.id === pt.id)!;
          setPopup({ point: cached, origin });
          return prev;
        });

        // Then refresh from server
        try {
          const fresh = await fetchDepositDetail(pt.id);
          setPopup((prev: any) => prev?.point.id === pt.id ? { ...prev, point: fresh } : prev);
          setPoints((prev) => prev.map((p) => (p.id === pt.id ? fresh : p)));
        } catch { /* silent */ }
      });

      markersRef.current[pt.id] = marker;
    });
  }, [points, leafletReady, leafletRef, markersRef, mapDivRef, setPoints, setPopup]);
}
