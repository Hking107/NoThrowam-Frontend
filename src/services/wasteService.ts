
// const getHeaders = () => {
//   const token = localStorage.getItem("token");
//   return {
//     'accept': 'application/json',
//     'Authorization': `Bearer ${token}`,
//     'ngrok-skip-browser-warning': 'true',
//     'Content-Type': 'application/json'
//   };
// };

// export const wasteService = {

//   getMyListings: async () => {
//     const response = await fetch('/api/v0/waste-posts/my/', {
//       method: 'GET',
//       headers: getHeaders(),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch listings. Status: ${response.status}`);
//     }

//     const data = await response.json();
//     return Array.isArray(data) ? data : (data.results || []);
//   },

//   getProposals: async (listingId: number | string) => {
//     const response = await fetch(`/api/v0/waste-posts/${listingId}/proposals/`, {
//       method: 'GET',
//       headers: getHeaders(),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch proposals. Status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.proposals || [];
//   }


// };


import { WebSocketService } from "./webSocketService";
import type { WastePost } from "../types/WastePost";

const API_BASE = import.meta.env.VITE_API_BASE || "https://no-throwam-backend.onrender.com";

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  };
};

// Pour les requêtes multipart/FormData : pas de Content-Type (le navigateur l'ajoute avec le boundary)
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
};

export const wasteService = {

  getWastePosts: async (): Promise<WastePost[]> => {
    const response = await fetch(`${API_BASE}/api/v0/waste-posts/`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("access_token") || ""}`,
        'ngrok-skip-browser-warning': '69420',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  getProposals: async (listingId: number | string) => {
    const response = await fetch(`${API_BASE}/api/v0/waste-posts/${listingId}/proposals/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch proposals");
    const data = await response.json();
    return data.proposals || [];
  },

  uploadImage: async (file: File) => {
    if (!file) throw new Error("No file provided");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Unsupported file type. Please upload an image (JPEG, PNG, WEBP).");
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/v0/waste-posts/upload-image/`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload image");
    return response.json();
  },

  hCreatePost: async (payload: any) => {
    const response = await fetch(`${API_BASE}/api/v0/waste-posts/create/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to create post");
    return response.json();
  },

  getMyListing: async () => {
    const response = await fetch(`${API_BASE}/api/v0/waste-posts/my/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch my listings");
    return response.json();
  },

  analyzePost: async (postId: number | string) => {
    const response = await fetch(`${API_BASE}/api/v0/waste-posts/${postId}/analyze/`, {
      method: 'POST',
      headers: getHeaders(),
    });
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
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://127.0.0.1:8000/api/v0/waste-posts/my/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Erreur");
    return response.json();
  },
  
};