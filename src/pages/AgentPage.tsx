import { ArrowRight, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { getResearchRun } from "../api";
import { JsonPreview } from "../components/JsonPreview";
import { StatusBadge } from "../components/StatusBadge";
import { StepTimeline } from "../components/StepTimeline";
import { UsageLog } from "../components/UsageLog";
import type { ResearchRun } from "../types";

export function AgentPage({ runId, onOpenReport }: { runId: string; onOpenReport: (id: string) => void }) {
  const [run, setRun] = useState<ResearchRun>();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      try {
        const next = await getResearchRun(runId);
        if (cancelled) return;
        setRun(next);
        setError("");
        if (next.status === "queued" || next.status === "running") {
          timer = window.setTimeout(load, 900);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    }

    load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [runId]);

  if (error) {
    return (
      <div className="page-stack narrow-page">
        <div className="error-box">{error}</div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="page-stack narrow-page">
        <section className="panel loading-panel">
          <RefreshCw className="spin" size={22} />
          <span>加载 Agent 任务...</span>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="run-heading">
        <div>
          <span className="eyebrow">Agent run</span>
          <h1>{run.input.target}</h1>
          <p>{run.target?.researchGoal || "Agent 正在解析调研目标并规划执行路径。"}</p>
        </div>
        <div className="run-actions">
          <StatusBadge status={run.status} />
          <button className="primary-button" disabled={!run.report} onClick={() => onOpenReport(run.id)}>
            <ArrowRight size={18} /> 查看报告
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>任务规划</h2>
          <span>{run.plan ? `${run.plan.tasks.length} tasks` : "planning"}</span>
        </div>
        {run.plan ? (
          <>
            <p className="muted-text">{run.plan.summary}</p>
            <div className="task-grid">
              {run.plan.tasks.map((task) => (
                <article key={task.id}>
                  <h3>{task.title}</h3>
                  <p>{task.objective}</p>
                  <span>{task.method}</span>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="muted-text">Agent 正在生成调研计划。</p>
        )}
      </section>

      <StepTimeline steps={run.steps} />
      <UsageLog usage={run.usage} />
      {run.error && <div className="error-box">{run.error}</div>}
      <JsonPreview value={{ target: run.target, snapshot: run.snapshot, analysis: run.analysis }} />
    </div>
  );
}
