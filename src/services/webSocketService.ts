
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
    
    // Auth: Le backend accepte le token via querystring (recommandé pour les WS dans le navigateur)
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
        
        // On récupère le type d'événement (ex: "posts_list", "post.created", "error")
        const eventType = parsed.type;
        const typeHandlers = this.handlers.get(eventType) || [];
        
        // ⚠️ MODIFICATION IMPORTANTE : On passe tout l'objet 'parsed' au composant
        // car le backend utilise des clés variables ("posts", "post", "message", etc.)
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
      this.ws?.close();
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
    // Garde la connexion active
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