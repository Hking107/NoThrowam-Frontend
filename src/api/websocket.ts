const API_BASE = import.meta.env.VITE_API_BASE || "https://no-throwam-backend.onrender.com";
const WS_PROTOCOL = API_BASE.startsWith("https") ? "wss" : "ws";
const WS_HOST = API_BASE.replace(/^https?:\/\//, "");

export const WS_BASE_URL = `${WS_PROTOCOL}://${WS_HOST}/ws/`;