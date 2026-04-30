import { Cpu, Gauge, ListChecks } from "lucide-react";
import type { ApiCallLog } from "../types";

export function UsageLog({ usage }: { usage: ApiCallLog[] }) {
  const totalTokens = usage.reduce((sum, item) => sum + (item.totalTokens || 0), 0);
  const totalDuration = usage.reduce((sum, item) => sum + item.durationMs, 0);

  return (
    <section className="panel">
      <div className="panel-title">
        <h2>API 使用展示</h2>
        <span>{usage.length} calls</span>
      </div>
      <div className="metric-grid">
        <div className="metric">
          <ListChecks size={18} />
          <span>调用次数</span>
          <strong>{usage.length}</strong>
        </div>
        <div className="metric">
          <Cpu size={18} />
          <span>Token 估算</span>
          <strong>{totalTokens || "N/A"}</strong>
        </div>
        <div className="metric">
          <Gauge size={18} />
          <span>总耗时</span>
          <strong>{totalDuration}ms</strong>
        </div>
      </div>
      <div className="usage-table-wrap">
        <table className="usage-table">
          <thead>
            <tr>
              <th>能力</th>
              <th>模型</th>
              <th>模式</th>
              <th>输入摘要</th>
              <th>输出摘要</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((item) => (
              <tr key={item.id}>
                <td>{item.capability}</td>
                <td>{item.model}</td>
                <td>{item.mode}</td>
                <td>{item.inputSummary}</td>
                <td>{item.outputSummary}</td>
              </tr>
            ))}
            {!usage.length && (
              <tr>
                <td colSpan={5}>Agent 启动后会在这里显示每次模型调用。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
