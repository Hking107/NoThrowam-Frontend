

type MessageHandler = (data: any) => void;

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
    const finalUrl = token ? `${this.url}?token=${token}` : this.url;

    this.ws = new WebSocket(finalUrl);

    this.ws.onopen = () => {
      console.log(` [WS] Connecté à ${this.url}`);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const typeHandlers = this.handlers.get(parsed.type) || [];
        typeHandlers.forEach(fn => fn(parsed.data));
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
      this.ws?.close(); 
    };
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
      console.log(`🔄 [WS] Reconnexion à ${this.url} dans ${delay}ms... (Essai ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error(`🚨 [WS] Abandon: Impossible de se reconnecter à ${this.url}`);
    }
  }

  private startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // Envoie un ping toutes les 30 secondes
  }

  private stopHeartbeat() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }
}