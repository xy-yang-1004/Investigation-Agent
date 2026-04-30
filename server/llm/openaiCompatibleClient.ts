import crypto from "node:crypto";
import type { AppConfig } from "../config";
import { summarize } from "../utils/text";
import type { LLMClient, LLMRequest, LLMResponse } from "./types";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string };
}

export class OpenAICompatibleClient implements LLMClient {
  provider = "openai-compatible";
  model: string;
  mode: "real" = "real";

  constructor(private readonly config: AppConfig) {
    this.model = config.model;
    if (!config.apiKey) {
      throw new Error("AI_API_KEY or OPENAI_API_KEY is required when MOCK_MODE=false.");
    }
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const startedAt = new Date().toISOString();
    const started = Date.now();
    const endpoint = `${this.config.apiBaseUrl.replace(/\/$/, "")}/chat/completions`;

    const body: Record<string, unknown> = {
      model: this.config.model,
      temperature: this.config.temperature,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt }
      ]
    };

    if (request.expectJson && !this.config.disableResponseFormat) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const payload = (await response.json().catch(() => ({}))) as ChatCompletionResponse;
    const durationMs = Date.now() - started;

    if (!response.ok) {
      const message = payload.error?.message || `Model API request failed with ${response.status}`;
      throw new Error(message);
    }

    const content = payload.choices?.[0]?.message?.content || "";
    return {
      content,
      log: {
        id: crypto.randomUUID(),
        stepId: request.stepId,
        capability: request.capability,
        provider: this.provider,
        model: this.model,
        mode: this.mode,
        startedAt,
        durationMs,
        inputSummary: summarize(request.userPrompt),
        outputSummary: summarize(content),
        promptTokens: payload.usage?.prompt_tokens,
        completionTokens: payload.usage?.completion_tokens,
        totalTokens: payload.usage?.total_tokens
      }
    };
  }
}
