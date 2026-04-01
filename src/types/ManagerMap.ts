/* ─── Types ─────────────────────────────────── */
export type Status = "collected" | "pending";

/* Raw shape returned by the backend */
export type ApiDeposit = {
  id: number;
  image: string;
  image_url: string;
  description: string;
  latitude: string;
  longitude: string;
  collected: boolean;
  collected_at: string | null;
  collected_by: number | null;
  ai_state: "NOT_REQUESTED" | "REQUESTED" | "DONE" | "ERROR";
  ai_payload: string | null;
  ai_error: string | null;
  created_at: string;
  updated_at: string;
};

/* Internal shape used by the map (same as before) */
export type GarbagePoint = {
  id: number;
  lat: number;
  lng: number;
  label: string;
  status: Status;
  images: { id: number; url: string }[];
};