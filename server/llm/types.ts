import type { ApiCallLog } from "../types";

export interface LLMRequest {
  stepId: string;
  capability: string;
  systemPrompt: string;
  userPrompt: string;
  expectJson?: boolean;
  context?: Record<string, unknown>;
}

export interface LLMResponse {
  content: string;
  log: ApiCallLog;
}

export interface LLMClient {
  provider: string;
  model: string;
  mode: "mock" | "real";
  complete(request: LLMRequest): Promise<LLMResponse>;
}
