import { authService } from "./authService";
import { API_BASE_URL as API_BASE } from "../config/api";

export async function createProposal(postId: number): Promise<{ alreadyExists: boolean; status?: string }> {
  const makeRequest = async () => {
    return fetch(`${API_BASE}/api/v0/proposals/waste-posts/${postId}/create/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAccessToken() || ""}`,
        "ngrok-skip-browser-warning": "69420",
      },
    });
  };

  let res = await makeRequest();
  if (res.status === 401) {
    try {
      await authService.refresh();
      res = await makeRequest();
    } catch (err) {
      console.error("Refresh token failed", err);
      authService.logout();
      throw new Error("Session expired. Please login again.");
    }
  }

  if (res.status === 200) {
    const data = await res.json().catch(() => ({}));
    return { alreadyExists: true, status: data.status };
  }
  if (res.status === 201) return { alreadyExists: false };
  const err = await res.json().catch(() => ({}));
  throw new Error((err as any)?.detail || `HTTP ${res.status}`);
}