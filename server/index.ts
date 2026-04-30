import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig, shouldUseMock } from "./config";
import { createLLMClient } from "./llm";
import { runResearchAgent } from "./agent/researchAgent";
import { reportToJson, reportToMarkdown } from "./report/exporters";
import { FileRunStore } from "./storage/runStore";
import type { ResearchInput } from "./types";

const config = getConfig();
const app = express();
const store = new FileRunStore();
const client = createLLMClient(config);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

app.use(express.json({ limit: "1mb" }));

function validateInput(body: Partial<ResearchInput>): ResearchInput {
  const target = String(body.target || "").trim();
  const url = String(body.url || "").trim();
  if (!target && !url) {
    throw new Error("请输入供应商名称、产品类别或官网 URL。");
  }
  return {
    target: target || url,
    industry: body.industry?.trim() || undefined,
    productCategory: body.productCategory?.trim() || undefined,
    url: url || undefined,
    language: body.language || "zh-CN"
  };
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    mode: shouldUseMock(config) ? "mock" : "real",
    model: client.model,
    provider: client.provider,
    siteFetch: config.enableSiteFetch
  });
});

app.get("/api/runs", async (_request, response, next) => {
  try {
    response.json(await store.list(20));
  } catch (error) {
    next(error);
  }
});

app.post("/api/research", async (request, response, next) => {
  try {
    const input = validateInput(request.body || {});
    const run = await store.create(input);

    void runResearchAgent(run.id, { store, client, config }).catch(async (error) => {
      await store.update(run.id, (draft) => {
        draft.status = "failed";
        draft.error = error instanceof Error ? error.message : String(error);
      });
    });

    response.status(202).json(run);
  } catch (error) {
    next(error);
  }
});

app.get("/api/research/:id", async (request, response) => {
  const run = await store.get(request.params.id);
  if (!run) {
    response.status(404).json({ error: "Run not found." });
    return;
  }
  response.json(run);
});

app.get("/api/reports/:id/export/:format", async (request, response, next) => {
  try {
    const run = await store.get(request.params.id);
    if (!run || !run.report) {
      response.status(404).json({ error: "Report not found or not ready." });
      return;
    }

    if (request.params.format === "json") {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.setHeader("Content-Disposition", `attachment; filename="${run.id}-supplier-report.json"`);
      response.send(reportToJson(run));
      return;
    }

    if (request.params.format === "markdown" || request.params.format === "md") {
      response.setHeader("Content-Type", "text/markdown; charset=utf-8");
      response.setHeader("Content-Disposition", `attachment; filename="${run.id}-supplier-report.md"`);
      response.send(reportToMarkdown(run));
      return;
    }

    response.status(400).json({ error: "Unsupported export format." });
  } catch (error) {
    next(error);
  }
});

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "API route not found." });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : String(error);
  response.status(400).json({ error: message });
});

if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(projectRoot, "dist/client");
  app.use(express.static(clientDist));
  app.get("*", (_request, response) => {
    response.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
}

app.listen(config.port, () => {
  const mode = shouldUseMock(config) ? "mock" : "real";
  console.log(`SupplierScope AI running at http://localhost:${config.port}`);
  console.log(`Model mode: ${mode}, provider: ${client.provider}, model: ${client.model}`);
});
