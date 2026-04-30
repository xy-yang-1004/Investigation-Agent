import type { WebsiteSnapshot } from "../types";

function normalizeUrl(rawUrl: string) {
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  return `https://${rawUrl}`;
}

function decodeHtml(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function matchContent(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  return match?.[1] ? decodeHtml(match[1].replace(/\s+/g, " ").trim()) : undefined;
}

function extractHeadings(html: string) {
  const headings: string[] = [];
  const regex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gis;
  for (const match of html.matchAll(regex)) {
    const text = decodeHtml(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (text) headings.push(text);
    if (headings.length >= 8) break;
  }
  return headings;
}

function extractTextSample(html: string) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1800)
  );
}

export async function fetchWebsiteSnapshot(rawUrl: string, timeoutMs: number): Promise<WebsiteSnapshot> {
  const url = normalizeUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "SupplierScopeAI/0.1 local research agent"
      }
    });
    const html = await response.text();
    return {
      url,
      title: matchContent(html, /<title[^>]*>(.*?)<\/title>/is),
      description: matchContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/is),
      headings: extractHeadings(html),
      textSample: extractTextSample(html),
      fetchedAt: new Date().toISOString(),
      error: response.ok ? undefined : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      url,
      headings: [],
      textSample: "",
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}
