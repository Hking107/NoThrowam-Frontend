import { useEffect } from "react";
import { ManagerMapBus as MapEventBus } from "../services/eventBus";
import type { GarbagePoint } from "../types/ManagerMap";

interface UseManagerMapEventsArgs {
  pointsRef:  React.MutableRefObject<GarbagePoint[]>;
  leafletRef: React.MutableRefObject<any>;
  setPoints:  React.Dispatch<React.SetStateAction<GarbagePoint[]>>;
  setPopup:   React.Dispatch<React.SetStateAction<any>>;
  flashRing:  (ptId: number, color: string) => void;
  showToast:  (msg: string) => void;
}

export function useManagerMapEvents({
  pointsRef, leafletRef, setPoints, setPopup, flashRing, showToast,
}: UseManagerMapEventsArgs) {

  /* Register state provider */
  useEffect(() => {
    MapEventBus.registerStateProvider(() => ({
      points: pointsRef.current.map(({ id, label, status, lat, lng }) => ({
        id, label, status, lat, lng,
      })),
    }));
  }, [pointsRef]);

  /* Listen to commands */
  useEffect(() => {
    const unsub = MapEventBus.onCommand((cmd) => {
      const map = leafletRef.current;

      switch (cmd.type) {
        case "collect":
          setPoints((prev) => prev.map((p) => p.id === cmd.pointId ? { ...p, status: "collected" } : p));
          setPopup((prev: any) =>
            prev?.point.id === cmd.pointId ? { ...prev, point: { ...prev.point, status: "collected" } } : prev);
          flashRing(cmd.pointId, "#007a5e");
          break;

        case "uncollect":
          setPoints((prev) => prev.map((p) => p.id === cmd.pointId ? { ...p, status: "pending" } : p));
          flashRing(cmd.pointId, "#ce1126");
          break;

        case "highlight":
          flashRing(cmd.pointId, "#facc15");
          break;

        case "highlight_all_pending":
          pointsRef.current.filter((p) => p.status === "pending")
            .forEach((p, i) => setTimeout(() => flashRing(p.id, "#ce1126"), i * 200));
          showToast("🔴 Highlighting all pending points");
          break;

        case "highlight_all_collected":
          pointsRef.current.filter((p) => p.status === "collected")
            .forEach((p, i) => setTimeout(() => flashRing(p.id, "#007a5e"), i * 200));
          showToast("🟢 Highlighting all collected points");
          break;

        case "fly_to":
          map?.flyTo([cmd.lat, cmd.lng], 16, { animate: true, duration: 1.3 });
          showToast("🗺️ Flying to location…");
          break;

        case "clear_highlights":
          // Caller is responsible for clearing rings state
          showToast("Map highlights cleared");
          break;

        case "show_stats":
          showToast("📊 Stats refreshed");
          break;
      }
    });
    return unsub;
  }, [pointsRef, leafletRef, setPoints, setPopup, flashRing, showToast]);
}
