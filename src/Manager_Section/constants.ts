import type { Status } from "../types/ManagerMap";

/** Marker fill colours keyed by status */
export const CLR: Record<Status, string> = {
  collected: "#007a5e", // brand green
  pending:   "#ce1126", // red
};
