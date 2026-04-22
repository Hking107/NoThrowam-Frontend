/**
 * Configuration centralisée pour les URLs API et WebSocket
 * Les variables peuvent être surcharger par des variables d'environnement
 */

// Déterminer si on est en HTTPS ou HTTP basé sur le protocole du frontend
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

// Récupérer le host du serveur (backend) depuis les variables d'environnement ou utiliser une valeur par défaut
const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST || 'localhost:8000';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || `http://localhost:8000/api`;

// URLs WebSocket
export const WS_BASE_URL = `${protocol}://${BACKEND_HOST}/ws`;
export const WS_POSTS_URL = `${WS_BASE_URL}/posts/global/`;
export const WS_DEPOSITS_URL = `${WS_BASE_URL}/deposits/global/`;

// URLs API REST
export const API_BASE_URL = BACKEND_API_URL;
export const API_AUTH_URL = `${API_BASE_URL}/auth`;
export const API_POSTS_URL = `${API_BASE_URL}/posts`;
export const API_DEPOSITS_URL = `${API_BASE_URL}/deposits`;

// Logs pour le debugging
console.log('[Config] Protocol:', protocol);
console.log('[Config] Backend Host:', BACKEND_HOST);
console.log('[Config] WS Base URL:', WS_BASE_URL);
console.log('[Config] API Base URL:', API_BASE_URL);
