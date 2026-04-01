
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { WebSocketService } from '../services/webSocketService';
import { WS_BASE_URL } from '../api/websocket';

interface WSContextType {
  marketWs: WebSocketService;
  customerWs: WebSocketService;
}

const WSContext = createContext<WSContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const marketWs = useRef(new WebSocketService(`${WS_BASE_URL}/ws/marketplace/posts/`));
  const customerWs = useRef(new WebSocketService(`${WS_BASE_URL}/ws/customer/proposals/`));

  useEffect(() => {
    marketWs.current.connect();
    
    if (localStorage.getItem('token')) {
      customerWs.current.connect();
    }

    return () => {
      marketWs.current.disconnect();
      customerWs.current.disconnect();
    };
  }, []);

  return (
    <WSContext.Provider value={{ marketWs: marketWs.current, customerWs: customerWs.current }}>
      {children}
    </WSContext.Provider>
  );
};

export const useGlobalWebSockets = () => {
  const context = useContext(WSContext);
  if (!context) throw new Error("useGlobalWebSockets doit être utilisé dans WebSocketProvider");
  return context;
};