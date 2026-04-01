

export type AgentStep = { id: string; label: string; done: boolean };

export type AgentResult = {
  reply: string;
  commands: MapCommand[];
  steps: AgentStep[];
  purchaseState?: PurchaseState;
};

export type Msg = {
  id: string; role: "user" | "agent"; text: string;
  steps?: AgentStep[]; commands?: MapCommand[]; ts: Date; thinking?: boolean;
};

export type MapCommand =
  | { type: "highlight";             pointId: number }
  | { type: "highlight_all_available" }
  | { type: "fly_to";                lat: number; lng: number }
  | { type: "clear_highlights" }
  | { type: "open_purchase";         pointId: number; quantity: number }
  | { type: "show_cart" };

export type PurchaseState =
  | { phase: "idle" }
  | { phase: "selecting"; pointId: number; qty: number }
  | { phase: "payment";   items: CartItem[]; total: number; currency: string }
  | { phase: "processing"; method: string }
  | { phase: "done";      txRef: string };


export type MarketPoint = {
  id: number; label: string; category: string;
  lat: number; lng: number;
  fixedPrice: number; currency: string; fixedWeight: number;
};

export type CartItem = { pointId: number; label: string; qty: number; unitPrice: number; currency: string };

export type MapStateSnapshot = { points: MarketPoint[]; cart: CartItem[] };

export type MapStateSnapshotLocal = { points: MarketPoint[]; cart: CartItem[] };