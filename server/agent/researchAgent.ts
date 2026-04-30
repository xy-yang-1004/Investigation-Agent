import type { AppConfig } from "../config";
import type { FileRunStore } from "../storage/runStore";
import type {
  ResearchPlan,
  ResearchRun,
  ResearchSnapshot,
  ResearchTarget,
  SupplierAnalysis,
  SupplierReport
} from "../types";
import { extractJsonObject, asErrorMessage } from "../utils/text";
import { fetchWebsiteSnapshot } from "../utils/webCollector";
import type { LLMClient } from "../llm/types";
import {
  buildAnalysisPrompt,
  buildCollectionPrompt,
  buildParseInputPrompt,
  buildPlanningPrompt,
  buildReportPrompt
} from "./prompts";

interface ResearchAgentDeps {
  store: FileRunStore;
  client: LLMClient;
  config: AppConfig;
}

async function markStep(store: FileRunStore, runId: string, stepId: string, status: "running" | "completed" | "failed", fields: Partial<ResearchRun["steps"][number]> = {}) {
  await store.update(runId, (run) => {
    const step = run.steps.find((item) => item.id === stepId);
    if (!step) return;
    step.status = status;
    if (status === "running") step.startedAt = new Date().toISOString();
    if (status === "completed" || status === "failed") step.completedAt = new Date().toISOString();
    Object.assign(step, fields);
  });
}

async function callJson<T>(
  store: FileRunStore,
  runId: string,
  client: LLMClient,
  request: Parameters<LLMClient["complete"]>[0]
) {
  const response = await client.complete({ ...request, expectJson: true });
  await store.update(runId, (run) => {
    run.usage.push(response.log);
  });
  return JSON.parse(extractJsonObject(response.content)) as T;
}

function summarizeResult(stepId: string, result: unknown) {
  if (stepId === "parse-input") {
    const target = result as ResearchTarget;
    return `识别为 ${target.inputType} 调研：${target.supplierName} / ${target.productCategory}`;
  }
  if (stepId === "plan-research") {
    const plan = result as ResearchPlan;
    return `生成 ${plan.tasks.length} 个调研任务：${plan.summary}`;
  }
  if (stepId === "collect-context") {
    const snapshot = result as ResearchSnapshot;
    return `整理 ${snapshot.supplierSignals.length + snapshot.productSignals.length} 条供应商与产品信号，识别 ${snapshot.potentialCompetitors.length} 个竞品方向。`;
  }
  if (stepId === "analyze-supplier") {
    const analysis = result as SupplierAnalysis;
    return `形成 ${analysis.strengths.length} 条优势、${analysis.risks.length} 条风险，适配评分 ${analysis.cooperationAdvice.fitScore}/100。`;
  }
  const report = result as SupplierReport;
  return `完成报告：${report.title}`;
}

async function completeStep<T>(
  store: FileRunStore,
  runId: string,
  stepId: string,
  result: T,
  assign: (run: ResearchRun) => void
) {
  await store.update(runId, (run) => {
    const step = run.steps.find((item) => item.id === stepId);
    if (step) {
      step.status = "completed";
      step.completedAt = new Date().toISOString();
      step.resultSummary = summarizeResult(stepId, result);
      step.result = result;
    }
    assign(run);
  });
}

async function runStep<T>(
  store: FileRunStore,
  runId: string,
  stepId: string,
  work: () => Promise<T>,
  assign: (run: ResearchRun, result: T) => void
) {
  await markStep(store, runId, stepId, "running");
  try {
    const result = await work();
    await completeStep(store, runId, stepId, result, (run) => assign(run, result));
    return result;
  } catch (error) {
    const message = asErrorMessage(error);
    await markStep(store, runId, stepId, "failed", { error: message });
    await store.update(runId, (run) => {
      run.status = "failed";
      run.error = message;
    });
    throw error;
  }
}

export async function runResearchAgent(runId: string, deps: ResearchAgentDeps) {
  const { store, client, config } = deps;
  const run = await store.get(runId);
  if (!run) throw new Error(`Run ${runId} was not found.`);

  await store.update(runId, (draft) => {
    draft.status = "running";
  });

  const target = await runStep(
    store,
    runId,
    "parse-input",
    async () => {
      const prompt = buildParseInputPrompt(run.input);
      return callJson<ResearchTarget>(store, runId, client, {
        stepId: "parse-input",
        capability: "intent-parsing",
        ...prompt,
        context: { input: run.input }
      });
    },
    (draft, result) => {
      draft.target = result;
    }
  );

  const plan = await runStep(
    store,
    runId,
    "plan-research",
    async () => {
      const prompt = buildPlanningPrompt(target);
      return callJson<ResearchPlan>(store, runId, client, {
        stepId: "plan-research",
        capability: "research-planning",
        ...prompt,
        context: { input: run.input, target }
      });
    },
    (draft, result) => {
      draft.plan = result;
    }
  );

  const snapshot = await runStep(
    store,
    runId,
    "collect-context",
    async () => {
      const websiteHints =
        config.enableSiteFetch && target.url
          ? await fetchWebsiteSnapshot(target.url, config.siteFetchTimeoutMs)
          : undefined;
      const prompt = buildCollectionPrompt(target, plan, websiteHints);
      const result = await callJson<ResearchSnapshot>(store, runId, client, {
        stepId: "collect-context",
        capability: "information-collection",
        ...prompt,
        context: { input: run.input, target, plan, websiteHints }
      });
      if (websiteHints) result.websiteHints = websiteHints;
      return result;
    },
    (draft, result) => {
      draft.snapshot = result;
    }
  );

  const analysis = await runStep(
    store,
    runId,
    "analyze-supplier",
    async () => {
      const prompt = buildAnalysisPrompt(target, snapshot);
      return callJson<SupplierAnalysis>(store, runId, client, {
        stepId: "analyze-supplier",
        capability: "supplier-analysis",
        ...prompt,
        context: { input: run.input, target, plan, snapshot }
      });
    },
    (draft, result) => {
      draft.analysis = result;
    }
  );

  await runStep(
    store,
    runId,
    "generate-report",
    async () => {
      const prompt = buildReportPrompt(target, snapshot, analysis);
      const report = await callJson<SupplierReport>(store, runId, client, {
        stepId: "generate-report",
        capability: "report-generation",
        ...prompt,
        context: { input: run.input, target, plan, snapshot, analysis }
      });
      report.generatedAt = report.generatedAt || new Date().toISOString();
      return report;
    },
    (draft, result) => {
      draft.report = result;
      draft.status = "completed";
    }
  );
}
