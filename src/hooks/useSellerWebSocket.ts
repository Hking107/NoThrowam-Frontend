// src/hooks/useSellerWebSocket.ts
import { useEffect, useRef } from 'react';
import { WebSocketService } from '../services/webSocketService';
import { WS_BASE_URL } from '../api/websocket';


export const useSellerWebSocket = (postId: number | undefined) => {
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    if (!postId) return;

    // 1. Initialiser le service pour CE post précis
    const ws = new WebSocketService(`${WS_BASE_URL}/ws/seller/posts/${postId}/proposals/`);
    wsRef.current = ws;

    // 2. Se connecter
    ws.connect();

    // 3. Déconnexion quand l'utilisateur quitte la page de ce post
    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [postId]);

  // Retourne l'instance pour permettre au composant d'utiliser .on() et .off()
  return wsRef.current;
};