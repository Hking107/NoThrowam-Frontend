import { authService } from "./authService";
import { WebSocketService } from "./webSocketService";
import type { WastePost } from "../types/WastePost";

import { API_BASE_URL as API_BASE } from "../config/api";

const getHeaders = async () => {
  const token = await authService.getAccessToken();
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  };
};

// Pour les requêtes multipart/FormData : pas de Content-Type (le navigateur l'ajoute avec le boundary)
const getAuthHeader = async () => {
  const token = await authService.getAccessToken();
  return { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
};

export const wasteService = {

  getWastePosts: async (): Promise<WastePost[]> => {
    const makeRequest = async () => {
      const token = await authService.getAccessToken();
      return fetch(`${API_BASE}/api/v0/waste-posts/`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token || ""}`,
          'ngrok-skip-browser-warning': '69420',
        },
      });
    };

    let response = await makeRequest();
    if (response.status === 401) {
      try {
        await authService.refresh();
        response = await makeRequest();
      } catch (err) {
        console.error("Refresh token failed", err);
        authService.logout();
        throw new Error("Session expired. Please login again.");
      }
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  getProposals: async (listingId: number | string) => {
    const makeRequest = async () => {
      return fetch(`${API_BASE}/api/v0/waste-posts/${listingId}/proposals/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
    };

    let response = await makeRequest();
    if (response.status === 401) {
      try {
        await authService.refresh();
        response = await makeRequest();
      } catch (err) {
        console.error("Refresh token failed", err);
        authService.logout();
        throw new Error("Session expired. Please login again.");
      }
    }
    if (!response.ok) throw new Error("Failed to fetch proposals");
    const data = await response.json();
    return data.proposals;
  },

  acceptProposal: async (proposalId: number | string) => {
    const makeRequest = async () => {
      return fetch(`${API_BASE}/api/v0/proposals/${proposalId}/accept/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
    };

    let response = await makeRequest();
    if (response.status === 401) {
      try {
        await authService.refresh();
        response = await makeRequest();
      } catch (err) {
        console.error("Refresh token failed", err);
        authService.logout();
        throw new Error("Session expired. Please login again.");
      }
    }
    if (!response.ok) throw new Error("Failed to accept proposal");
    return response.json();
  },

  uploadImage: async (file: File) => {
    if (!file) throw new Error("No file provided");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Unsupported file type. Please upload an image (JPEG, PNG, WEBP).");
    }

    const formData = new FormData();
    formData.append('file', file);

    const makeRequest = async () => {
      return fetch(`${API_BASE}/api/v0/waste-posts/upload-image/`, {
        method: 'POST',
        headers: await getAuthHeader(),
        body: formData,
      });
    };

    let response = await makeRequest();
    if (response.status === 401) {
      try {
        await authService.refresh();
        response = await makeRequest();
      } catch (err) {
        console.error("Refresh token failed", err);
        authService.logout();
        throw new Error("Session expired. Please login again.");
      }
    }
    if (!response.ok) throw new Error("Failed to upload image");
    return response.json();
  },

  hCreatePost: async (payload: any) => {
    const makeRequest = async () => {
      return fetch(`${API_BASE}/api/v0/waste-posts/create/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(payload),
      });
    };

    let response = await makeRequest();
    if (response.status === 401) {
      try {
        await authService.refresh();
        response = await makeRequest();
      } catch (err) {
        console.error("Refresh token failed", err);
        authService.logout();
        throw new Error("Session expired. Please login again.");
      }
    }
    if (!response.ok) throw new Error("Failed to create post");
    return response.json();
  },

  getMyListing: async () => {
    const makeRequest = async () => {
      return fetch(`${API_BASE}/api/v0/waste-posts/my/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
    };

    let response = await makeRequest();
    if (response.status === 401) {
      try {
        await authService.refresh();
        response = await makeRequest();
      } catch (err) {
        console.error("Refresh token failed", err);
        authService.logout();
        throw new Error("Session expired. Please login again.");
      }
    }
    if (!response.ok) throw new Error("Failed to fetch my listings");
    return response.json();
  },

  analyzePost: async (postId: number | string) => {
    const makeRequest = async () => {
      return fetch(`${API_BASE}/api/v0/waste-posts/${postId}/analyze/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
    };

    let response = await makeRequest();
    if (response.status === 401) {
      try {
        await authService.refresh();
        response = await makeRequest();
      } catch (err) {
        console.error("Refresh token failed", err);
        authService.logout();
        throw new Error("Session expired. Please login again.");
      }
    }
    if (!response.ok) throw new Error("Failed to analyze post");
    return response.json();
  },

  createPost: (ws: WebSocketService, payload: any) => {
    ws.sendEvent('post.create', payload);
  },

  reportDeposit: (ws: WebSocketService, payload: any) => {
    ws.sendEvent('deposit.create', payload);
  },

  getMyListings: async () => {
    const makeRequest = async () => {
      const token = await authService.getAccessToken();
      return fetch(`${API_BASE}/api/v0/waste-posts/my/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    };

    let response = await makeRequest();
    if (response.status === 401) {
      try {
        await authService.refresh();
        response = await makeRequest();
      } catch (err) {
        console.error("Refresh token failed", err);
        authService.logout();
        throw new Error("Session expired. Please login again.");
      }
    }
    if (!response.ok) throw new Error("Erreur");
    return response.json();
  },

};