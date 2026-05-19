/**
 * Configuration centralisée pour les URLs API et WebSocket
 * L'URL backend principale est récupérée via VITE_API_BASE.
 */

const rawBase = import.meta.env.VITE_API_BASE || "https://no-throwam-backend.onrender.com";

// Validation et normalisation de l'URL pour la sécuriser et éviter les appels relatifs par erreur
// Si l'utilisateur a rentré "127.0.0.1:8000" sans http://, le navigateur le traitera comme une route relative.
export const API_BASE_URL = /^https?:\/\//i.test(rawBase)
    ? rawBase.replace(/\/$/, "")
    : `http://${rawBase}`.replace(/\/$/, "");

// Déterminer le protocole WebSocket et le host à partir de API_BASE_URL
const WS_PROTOCOL = API_BASE_URL.startsWith("https") ? "wss" : "ws";
const WS_HOST = API_BASE_URL.replace(/^https?:\/\//i, "");

// URLs WebSocket
export const WS_BASE_URL = `${WS_PROTOCOL}://${WS_HOST}/ws`;
export const WS_POSTS_URL = `${WS_BASE_URL}/posts/global/`;
export const WS_DEPOSITS_URL = `${WS_BASE_URL}/deposits/global/`;

// URLs API REST spécifiques
export const API_AUTH_URL = `${API_BASE_URL}/api/v0/auth`;
export const API_POSTS_URL = `${API_BASE_URL}/api/v0/waste-posts`;
export const API_DEPOSITS_URL = `${API_BASE_URL}/api/v0/deposits`;
export const API_PAYMENTS_URL = `${API_BASE_URL}/api/v0/payments`;

// Helper for dynamic Seller Payments WebSocket
export const WS_SELLER_PAYMENTS_URL = (sellerId: number, accessToken: string) =>
  `${WS_BASE_URL}/payments/seller/${sellerId}/?token=${encodeURIComponent(accessToken)}`;
