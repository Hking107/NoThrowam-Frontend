
type MessageHandler = (message: any) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private intentionalDisconnect = false;

  constructor(url: string) {
    this.url = url;
  }

  public connect() {
    this.intentionalDisconnect = false;
    
    const token = localStorage.getItem('token');
    let finalUrl = this.url;

    if (token) {
      try {
        const urlObj = new URL(this.url);
        urlObj.searchParams.set('token', token); 
        finalUrl = urlObj.toString();
      } catch (e) {
        console.error("[WS] Erreur lors de la construction de l'URL", e);
      }
    }

    console.log(`[WS] Tentative de connexion à : ${finalUrl}`);
    this.ws = new WebSocket(finalUrl);

    this.ws.onopen = () => {
      console.log(`✅ [WS] Connecté à ${finalUrl}`);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        const eventType = parsed.type;
        const typeHandlers = this.handlers.get(eventType) || [];
        
        typeHandlers.forEach(fn => fn(parsed));
        
      } catch (e) {
        console.error("[WS] Erreur parsing message", event.data);
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      if (!this.intentionalDisconnect) {
        this.handleReconnect();
      } else {
        console.log(` [WS] Déconnecté proprement de ${this.url}`);
      }
    };

    this.ws.onerror = (err) => {
      console.error(` [WS] Erreur sur ${this.url}:`, err);
      };
  }

  public sendEvent(type: string, payload?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn(`[WS] Impossible d'envoyer '${type}', WebSocket non connecté.`);
    }
  }

  public on(type: string, handler: MessageHandler) {
    const current = this.handlers.get(type) || [];
    this.handlers.set(type, [...current, handler]);
  }

  public off(type: string, handler: MessageHandler) {
    const current = this.handlers.get(type) || [];
    this.handlers.set(type, current.filter(h => h !== handler));
  }

  public disconnect() {
    this.intentionalDisconnect = true;
    this.stopHeartbeat();
    this.ws?.close();
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * (2 ** this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay);
    }
  }

  private startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }
}