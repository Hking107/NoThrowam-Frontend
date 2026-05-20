/**
 * Deposit Service
 *
 * Handles all REST interactions with the waste-deposit endpoints.
 * No authentication is required for the guest "report" endpoint.
 */

import { API_BASE_URL as API_BASE } from "../config/api";

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

export interface UploadImageResponse {
  image_url: string;
}

export interface ReportDepositPayload {
  image: string; // URL returned by uploadImage
  description?: string;
  latitude?: number;
  longitude?: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

export const depositService = {
  /**
   * Upload a waste image to the server.
   *
   * Posts the image as multipart/form-data to the waste-posts
   * upload endpoint and returns the hosted image URL.
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE}/api/v0/deposits/upload-image/`, {
      method: "POST",
      body: formData,
      // No Content-Type header — the browser sets it with the boundary
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[uploadImage] HTTP", response.status, errorText);
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch { }
      throw new Error(
        errorData.detail ||
        errorData.message ||
        `Image upload failed (HTTP ${response.status})`,
      );
    }

    const data = await response.json();
    console.log("[uploadImage] success response:", data);
    return data.url;
  },

  /**
   * Report a waste deposit (guest — no auth required).
   *
   * Sends the image URL (obtained from uploadImage) along with
   * optional description and GPS coordinates.
   *
   * The backend runs AI analysis and returns both the deposit
   * record and any insights it was able to generate.
   */
  report: async (
    payload: ReportDepositPayload,
  ): Promise<ReportDepositResponse> => {
    const body: Record<string, unknown> = {
      image_url: payload.image,
    };

    if (payload.description) {
      body.description = payload.description;
    }
    if (payload.latitude !== undefined) {
      body.latitude = parseFloat(payload.latitude.toFixed(6));
    }
    if (payload.longitude !== undefined) {
      body.longitude = parseFloat(payload.longitude.toFixed(6));
    }

    console.log("[report] sending body:", body);

    const response = await fetch(`${API_BASE}/api/v0/deposits/report/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[report] HTTP", response.status, errorText);
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch { }
      throw new Error(
        errorData.detail ||
        errorData.message ||
        `Report failed (HTTP ${response.status})`,
      );
    }

    return await response.json();
  },
};

