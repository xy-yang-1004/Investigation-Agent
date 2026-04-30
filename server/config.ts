import fs from "node:fs";
import path from "node:path";
import type { MockMode } from "./types";

export interface AppConfig {
  port: number;
  mockMode: MockMode;
  apiKey?: string;
  apiBaseUrl: string;
  model: string;
  temperature: number;
  disableResponseFormat: boolean;
  enableSiteFetch: boolean;
  siteFetchTimeoutMs: number;
}

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = line.slice(0, equalsIndex).trim();
    const value = line.slice(equalsIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function readBoolean(name: string, fallback: boolean) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readNumber(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getConfig(): AppConfig {
  loadDotEnv();

  const mockMode = (process.env.MOCK_MODE || "auto").toLowerCase() as MockMode;
  const normalizedMockMode: MockMode = ["auto", "true", "false"].includes(mockMode) ? mockMode : "auto";

  return {
    port: readNumber("PORT", 5173),
    mockMode: normalizedMockMode,
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
    apiBaseUrl: process.env.AI_API_BASE_URL || "https://api.openai.com/v1",
    model: process.env.AI_MODEL || "gpt-4o-mini",
    temperature: readNumber("AI_TEMPERATURE", 0.2),
    disableResponseFormat: readBoolean("DISABLE_RESPONSE_FORMAT", false),
    enableSiteFetch: readBoolean("ENABLE_SITE_FETCH", false),
    siteFetchTimeoutMs: readNumber("SITE_FETCH_TIMEOUT_MS", 5000)
  };
}

export function shouldUseMock(config: AppConfig) {
  if (config.mockMode === "true") return true;
  if (config.mockMode === "false") return false;
  return !config.apiKey;
}
