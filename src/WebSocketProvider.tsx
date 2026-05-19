import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebSocketService } from './services/webSocketService';
import { WS_BASE_URL } from './api/websocket';
import { useAuth } from './contexts/AuthContext';

interface WSContextType {
  postsWs: WebSocketService;
  proposalWs: WebSocketService;
  proposalsWs: WebSocketService;
}

const WebSocketContext = createContext<WSContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [services] = useState<WSContextType>(() => {
    return {
      // Créer les instances de WebSocketService
      postsWs: new WebSocketService(`${WS_BASE_URL}posts/public/`),
      proposalWs: new WebSocketService(`${WS_BASE_URL}proposal/public/`),
      proposalsWs: new WebSocketService(`${WS_BASE_URL}proposals/public/`),
    };
  });

  useEffect(() => {
    // Si l'état d'authentification change et qu'on est connecté, on reconnecte
    services.postsWs.connect();
    services.proposalWs.connect();
    services.proposalsWs.connect();

    return () => {
      // Déconnecter proprement lors du nettoyage
      services.postsWs.disconnect();
      services.proposalWs.disconnect();
      services.proposalsWs.disconnect();
    };
  }, [services, isAuthenticated]);

  return (
    <WebSocketContext.Provider value={services}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket doit être utilisé à l'intérieur d'un WebSocketProvider");
  }
  return context;
};