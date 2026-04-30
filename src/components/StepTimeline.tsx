import { CheckCircle2, CircleDashed, LoaderCircle, XCircle } from "lucide-react";
import type { AgentStep } from "../types";
import { JsonPreview } from "./JsonPreview";

function iconFor(status: AgentStep["status"]) {
  if (status === "completed") return <CheckCircle2 className="step-icon ok" size={20} />;
  if (status === "running") return <LoaderCircle className="step-icon spin" size={20} />;
  if (status === "failed") return <XCircle className="step-icon danger" size={20} />;
  return <CircleDashed className="step-icon muted" size={20} />;
}

export function StepTimeline({ steps }: { steps: AgentStep[] }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <h2>Agent 执行步骤</h2>
        <span>{steps.filter((step) => step.status === "completed").length}/{steps.length} completed</span>
      </div>
      <div className="step-list">
        {steps.map((step) => (
          <article className="step-row" key={step.id}>
            <div className="step-status">{iconFor(step.status)}</div>
            <div className="step-body">
              <div className="step-heading">
                <h3>{step.title}</h3>
                <span>{step.status}</span>
              </div>
              <p>{step.objective}</p>
              {step.resultSummary && <div className="result-summary">{step.resultSummary}</div>}
              {step.error && <div className="error-box">{step.error}</div>}
              <JsonPreview value={step.result} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
