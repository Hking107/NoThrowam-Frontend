// src/contexts/WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { WebSocketService} from '../services/webSocketService';

interface WSContextType {
  postsWs: WebSocketService;
  depositsWs: WebSocketService;
}

const WSContext = createContext<WSContextType | null>(null);

const WS_HOST = "127.0.0.1:8000";
const WS_BASE_URL = `ws://${WS_HOST}/ws`;

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const postsWs = useRef(new WebSocketService(`${WS_BASE_URL}/posts/global/`));
  const depositsWs = useRef(new WebSocketService(`${WS_BASE_URL}/deposits/global/`));

  useEffect(() => {
    // On connecte les deux WebSocket au démarrage
    postsWs.current.connect();
    depositsWs.current.connect();

    return () => {
      postsWs.current.disconnect();
      depositsWs.current.disconnect();
    };
  }, []);

  return (
    <WSContext.Provider value={{ postsWs: postsWs.current, depositsWs: depositsWs.current }}>
      {children}
    </WSContext.Provider>
  );
};

export const useWebSockets = () => {
  const context = useContext(WSContext);
  if (!context) throw new Error("useWebSockets doit être utilisé dans WebSocketProvider");
  return context;
};