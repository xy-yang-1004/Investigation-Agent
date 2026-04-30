import { Download, FileJson, FileText, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { exportUrl, getResearchRun } from "../api";
import { ReportView } from "../components/ReportView";
import { StatusBadge } from "../components/StatusBadge";
import { UsageLog } from "../components/UsageLog";
import type { ResearchRun } from "../types";

export function ReportPage({ runId }: { runId: string }) {
  const [run, setRun] = useState<ResearchRun>();
  const [error, setError] = useState("");

  useEffect(() => {
    getResearchRun(runId).then(setRun).catch((err) => setError(err instanceof Error ? err.message : String(err)));
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
          <span>加载报告...</span>
        </section>
      </div>
    );
  }

  if (!run.report) {
    return (
      <div className="page-stack narrow-page">
        <section className="panel">
          <div className="panel-title">
            <h2>报告尚未完成</h2>
            <StatusBadge status={run.status} />
          </div>
          <p className="muted-text">请回到 Agent 执行页查看当前步骤状态。</p>
          <a className="secondary-button" href={`#/agent/${run.id}`}>
            返回执行页
          </a>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="export-bar">
        <div>
          <span className="eyebrow">Final report</span>
          <h1>结构化调研报告</h1>
        </div>
        <div className="export-actions">
          <a className="secondary-button" href={exportUrl(run.id, "markdown")} download>
            <FileText size={18} /> 导出 Markdown
          </a>
          <a className="secondary-button" href={exportUrl(run.id, "json")} download>
            <FileJson size={18} /> 导出 JSON
          </a>
          <a className="primary-button" href={`#/agent/${run.id}`}>
            <Download size={18} /> 执行详情
          </a>
        </div>
      </section>
      <ReportView report={run.report} />
      <UsageLog usage={run.usage} />
    </div>
  );
}
