import type { AppConfig } from "../config";
import { shouldUseMock } from "../config";
import { MockLLMClient } from "./mockClient";
import { OpenAICompatibleClient } from "./openaiCompatibleClient";
import type { LLMClient } from "./types";

export function createLLMClient(config: AppConfig): LLMClient {
  return shouldUseMock(config) ? new MockLLMClient() : new OpenAICompatibleClient(config);
}
