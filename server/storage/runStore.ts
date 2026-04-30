import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { AgentStep, ResearchInput, ResearchRun } from "../types";

function defaultSteps(): AgentStep[] {
  return [
    {
      id: "parse-input",
      title: "解析调研目标",
      objective: "识别用户输入中的供应商、行业、产品类型或 URL。",
      status: "pending"
    },
    {
      id: "plan-research",
      title: "规划调研步骤",
      objective: "将供应商调研拆解成可执行任务。",
      status: "pending"
    },
    {
      id: "collect-context",
      title: "搜集与整理信息",
      objective: "整理供应商、产品、价格、竞品和公开来源信号。",
      status: "pending"
    },
    {
      id: "analyze-supplier",
      title: "分析供应商价值与风险",
      objective: "形成产品、优势、风险、竞品和合作建议分析。",
      status: "pending"
    },
    {
      id: "generate-report",
      title: "生成结构化报告",
      objective: "输出可展示、可导出的最终调研报告。",
      status: "pending"
    }
  ];
}

function cloneRun(run: ResearchRun) {
  return JSON.parse(JSON.stringify(run)) as ResearchRun;
}

export class FileRunStore {
  private readonly runs = new Map<string, ResearchRun>();

  constructor(private readonly runsDir = path.resolve(process.cwd(), "data/runs")) {}

  async create(input: ResearchInput) {
    await fs.mkdir(this.runsDir, { recursive: true });
    const now = new Date().toISOString();
    const id = `run_${now.replace(/[-:.TZ]/g, "").slice(0, 14)}_${crypto.randomUUID().slice(0, 8)}`;
    const run: ResearchRun = {
      id,
      createdAt: now,
      updatedAt: now,
      status: "queued",
      input,
      steps: defaultSteps(),
      usage: []
    };
    await this.save(run);
    return cloneRun(run);
  }

  async get(id: string) {
    const cached = this.runs.get(id);
    if (cached) return cloneRun(cached);

    const file = path.join(this.runsDir, `${id}.json`);
    try {
      const run = JSON.parse(await fs.readFile(file, "utf8")) as ResearchRun;
      this.runs.set(id, run);
      return cloneRun(run);
    } catch {
      return undefined;
    }
  }

  async list(limit = 20) {
    await fs.mkdir(this.runsDir, { recursive: true });
    const files = (await fs.readdir(this.runsDir)).filter((file) => file.endsWith(".json"));
    const runs = await Promise.all(files.map((file) => this.get(path.basename(file, ".json"))));
    return runs
      .filter((run): run is ResearchRun => Boolean(run))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async update(id: string, updater: (run: ResearchRun) => void | ResearchRun) {
    const current = await this.get(id);
    if (!current) throw new Error(`Run ${id} was not found.`);

    const draft = cloneRun(current);
    const maybeUpdated = updater(draft);
    const updated = maybeUpdated || draft;
    updated.updatedAt = new Date().toISOString();
    await this.save(updated);
    return cloneRun(updated);
  }

  private async save(run: ResearchRun) {
    await fs.mkdir(this.runsDir, { recursive: true });
    this.runs.set(run.id, cloneRun(run));
    await fs.writeFile(path.join(this.runsDir, `${run.id}.json`), JSON.stringify(run, null, 2), "utf8");
  }
}
