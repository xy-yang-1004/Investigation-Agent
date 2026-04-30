import type { HealthStatus, ResearchInput, ResearchRun } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }
  return payload as T;
}

export function getHealth() {
  return request<HealthStatus>("/api/health");
}

export function createResearchRun(input: ResearchInput) {
  return request<ResearchRun>("/api/research", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function getResearchRun(id: string) {
  return request<ResearchRun>(`/api/research/${id}`);
}

export function exportUrl(id: string, format: "markdown" | "json") {
  return `/api/reports/${id}/export/${format}`;
}
