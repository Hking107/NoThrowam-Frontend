import type { AgentApiResponse } from "../types/AgentAPIResponse";
import type { 
  AgentResult, 
  AgentStep, 
  MapCommand, 
  MapStateSnapshot, 
  PurchaseState 
} from "../types/AIMessage";

const API_BASE = import.meta.env.VITE_API_BASE || "https://no-throwam-backend.onrender.com";

function mkStep(label: string): AgentStep {
  return { id: Math.random().toString(36).slice(2), label, done: true };
}

export const agentService = {
  callAgent: async (
    message: string,
    state: MapStateSnapshot,
    currentPurchase: PurchaseState 
  ): Promise<AgentResult> => {
    
    const userId = localStorage.getItem("user_id");

    const res = await fetch(`${API_BASE}/api/v0/agents/agentic-message/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({
        message,
        ...(userId ? { user_id: parseInt(userId, 10) } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.error || `HTTP ${res.status}`);
    }

    const data: AgentApiResponse = await res.json();

    const commands: MapCommand[] = [];
    let purchaseState: PurchaseState | undefined;

    if (data.mode === "action" && data.results?.length) {
      for (const r of data.results) {
        if (r?.post_id || r?.proposal?.post) {
          const postId = r.post_id ?? r.proposal?.post;
          const pt = state.points.find(p => p.id === postId);
          if (pt) {
            commands.push({ type: "open_purchase", pointId: pt.id, quantity: 1 });
            commands.push({ type: "fly_to", lat: pt.lat, lng: pt.lng });
            commands.push({ type: "highlight", pointId: pt.id });
            purchaseState = { phase: "selecting", pointId: pt.id, qty: 1 };
          }
        }
      }
    }

    const lower = data.response.toLowerCase();
    if (/available|market|lot|post|recyclable/i.test(lower) && commands.length === 0) {
      commands.push({ type: "highlight_all_available" });
    }

    const steps: AgentStep[] = [
      mkStep(`Mode: ${data.mode}`),
      mkStep(`Role: ${data.role}`),
      ...(data.results?.length ? [mkStep(`${data.results.length} action(s) completed`)] : []),
    ];

    return { reply: data.response, commands, steps, purchaseState };
  }
};