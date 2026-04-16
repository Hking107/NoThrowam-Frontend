/**
 * Deposit Service
 *
 * Handles all REST interactions with the waste-deposit endpoints.
 * No authentication is required for the guest "report" endpoint.
 */

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://no-throwam-backend.onrender.com";

// ── Types ────────────────────────────────────────────────────────────────────

export interface DepositInsights {
  waste_type: string;
  severity: number;
  recommendation: string;
  confidence: number;
}

export interface Deposit {
  id: number;
  image: string | null;
  image_url: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  collected: boolean;
  collected_at: string | null;
  collected_by: number | null;
  ai_state: "NOT_REQUESTED" | "PROCESSING" | "DONE" | "FAILED";
  ai_payload: DepositInsights | null;
  ai_error: string;
  created_at: string;
  updated_at: string;
}

export interface ReportDepositResponse {
  deposit: Deposit;
  insights: DepositInsights | null;
}

export interface ReportDepositPayload {
  image: File;
  description?: string;
  latitude?: number;
  longitude?: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

export const depositService = {
  /**
   * Report a waste deposit (guest — no auth required).
   *
   * Sends the image as multipart/form-data along with optional
   * description and GPS coordinates.
   *
   * The backend runs AI analysis and returns both the deposit
   * record and any insights it was able to generate.
   */
  report: async (payload: ReportDepositPayload): Promise<ReportDepositResponse> => {
    const formData = new FormData();
    formData.append("image", payload.image);

    if (payload.description) {
      formData.append("description", payload.description);
    }
    if (payload.latitude !== undefined) {
      formData.append("latitude", payload.latitude.toString());
    }
    if (payload.longitude !== undefined) {
      formData.append("longitude", payload.longitude.toString());
    }

    const response = await fetch(`${API_BASE}/api/v0/deposits/report/`, {
      method: "POST",
      body: formData,
      // No Content-Type header — the browser sets it with the boundary
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          errorData.message ||
          `Report failed (HTTP ${response.status})`,
      );
    }

    return await response.json();
  },
};
