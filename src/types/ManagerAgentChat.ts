

export type AgentApiResponse = {
  success: boolean;
  mode: "answer" | "action";
  response: string;
  role: string;
  results?: any[];
};

export type MapCommand =
  | { type: "collect";               pointId: number }
  | { type: "uncollect";             pointId: number }
  | { type: "highlight";             pointId: number }
  | { type: "highlight_all_pending" }
  | { type: "highlight_all_collected" }
  | { type: "fly_to";                lat: number; lng: number }
  | { type: "clear_highlights" }
  | { type: "show_stats" };

export type MapStateSnapshot = {
  points: { id: number; label: string; status: "collected" | "pending"; lat: number; lng: number }[];
};

export type AgentStep   = { id: string; label: string; done: boolean };
export type AgentResult = { reply: string; commands: MapCommand[]; steps: AgentStep[] };

export type Msg = {
  id: string; role: "user" | "agent"; text: string;
  image?: string; steps?: AgentStep[]; commands?: MapCommand[];
  ts: Date; thinking?: boolean;
};
