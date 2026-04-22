import { useState, useCallback, useEffect } from "react";
import type { GarbagePoint } from "../types/ManagerMap";
import { fetchAllDeposits } from "../services/ManagerService";

interface UseManagerMapDataReturn {
  points:      GarbagePoint[];
  setPoints:   React.Dispatch<React.SetStateAction<GarbagePoint[]>>;
  loading:     boolean;
  fetchError:  string | null;
  loadPoints:  () => Promise<void>;
}

export function useManagerMapData(
  leafletRef: React.MutableRefObject<any>,
  _mapDivRef:  React.MutableRefObject<HTMLDivElement | null>,
): UseManagerMapDataReturn {
  const [points,     setPoints]  = useState<GarbagePoint[]>([]);
  const [loading,    setLoading] = useState(true);
  const [fetchError, setFetchErr] = useState<string | null>(null);

  const loadPoints = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    try {
      const pts = await fetchAllDeposits();
      setPoints(pts);

      const map = leafletRef.current;
      if (map && window.L && pts.length > 0) {
        const withCoords = pts.filter((p) => p.lat !== 0 && p.lng !== 0);
        if (withCoords.length > 0) {
          const bounds = window.L.latLngBounds(withCoords.map((p) => [p.lat, p.lng]));
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
        }
      }
    } catch (err: any) {
      setFetchErr(err?.message ?? "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [leafletRef]);

  useEffect(() => { loadPoints(); }, [loadPoints]);

  return { points, setPoints, loading, fetchError, loadPoints };
}
