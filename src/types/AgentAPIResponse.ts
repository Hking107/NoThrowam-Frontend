export type AgentApiResponse = {
  success: boolean;
  mode: "answer" | "action";
  response: string;
  role: string;
  results?: any[];
};

