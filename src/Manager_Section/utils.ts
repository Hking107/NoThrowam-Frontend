import type { ApiDeposit, GarbagePoint, Status } from "../types/ManagerMap";

/**
 * Points are visible for 24 hours from their reference time:
 * - Pending points: 24h from creation
 * - Collected points: 24h from collection
 */
export function isVisiblePoint(createdAt: string, collectedAt: string | null): boolean {
  const referenceTime = collectedAt || createdAt;
  const hoursDiff = (Date.now() - new Date(referenceTime).getTime()) / (1000 * 60 * 60);
  const isValid = hoursDiff <= 24;
  
  // Debug logging
  console.log(`Point visibility check:`, {
    createdAt,
    collectedAt,
    referenceTime,
    hoursDiff: Math.round(hoursDiff * 100) / 100,
    isValid
  });
  
  return isValid;
}

export function toPoint(d: ApiDeposit): GarbagePoint {
  const status: Status = d.collected ? "collected" : "pending";

  return {
    id:          d.id,
    lat:         parseFloat(d.latitude)  || 0,
    lng:         parseFloat(d.longitude) || 0,
    label:       d.description?.trim()   || `Dépôt #${d.id}`,
    status,
    images:
      d.image_url ? [{ id: 1, url: d.image_url }]
      : d.image   ? [{ id: 1, url: d.image }]
      :              [],
    created_at:  d.created_at,
    collected_at: d.collected_at,
    isValid:     isVisiblePoint(d.created_at, d.collected_at),
  };
}
