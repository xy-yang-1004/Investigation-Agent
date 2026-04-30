import type { RunStatus, StepStatus } from "../types";

export function StatusBadge({ status }: { status: RunStatus | StepStatus }) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}
