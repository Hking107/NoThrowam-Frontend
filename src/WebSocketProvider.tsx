import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebSocketService } from './services/webSocketService';
import { WS_BASE_URL } from './api/websocket';

const WebSocketContext = createContext<WebSocketService | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [wsService] = useState(() => {
    const token = localStorage.getItem('token');
    const wsUrl = token 
      ? `${WS_BASE_URL}?token=${token}`
      : WS_BASE_URL;
      
    return new WebSocketService(wsUrl);
  });

  useEffect(() => {
    wsService.connect();

    return () => {
      wsService.disconnect();
    };
  }, [wsService]);

  return (
    <WebSocketContext.Provider value={wsService}>
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