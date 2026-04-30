import { ArrowRight, Boxes, ClipboardList, FileDown, ShieldCheck, Workflow } from "lucide-react";
import type { HealthStatus } from "../types";

export function HomePage({ health, onStart }: { health?: HealthStatus; onStart: () => void }) {
  return (
    <div className="page-stack">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">AI Agent for procurement research</span>
          <h1>AI Agent 驱动的供应商调研与自动化报告生成平台</h1>
          <p>
            输入供应商名称、产品类别或官网 URL，系统会自动解析目标、规划调研步骤、整理公开信号、分析风险和竞品，并生成可导出的 Markdown / JSON 报告。
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onStart}>
              <ArrowRight size={18} /> 开始调研
            </button>
            <a className="secondary-button" href="#/research">
              <ClipboardList size={18} /> 查看输入页
            </a>
          </div>
        </div>
        <div className="workflow-visual" aria-label="Agent workflow">
          <div className="workflow-node active">
            <Workflow size={20} />
            <span>目标解析</span>
          </div>
          <div className="workflow-line" />
          <div className="workflow-node">
            <Boxes size={20} />
            <span>资料整理</span>
          </div>
          <div className="workflow-line" />
          <div className="workflow-node">
            <ShieldCheck size={20} />
            <span>风险分析</span>
          </div>
          <div className="workflow-line" />
          <div className="workflow-node">
            <FileDown size={20} />
            <span>报告导出</span>
          </div>
        </div>
      </section>

      <section className="value-grid">
        <article>
          <h2>真实业务场景</h2>
          <p>面向采购、运营、市场和创业团队，用于快速建立供应商初筛、询价准备和合作风险判断。</p>
        </article>
        <article>
          <h2>Agent 可解释执行</h2>
          <p>每次任务都会展示规划、步骤状态、中间结果、模型调用能力、调用次数和输入输出摘要。</p>
        </article>
        <article>
          <h2>API 供应商友好</h2>
          <p>服务端封装 OpenAI-compatible API，支持环境变量配置、mock 模式和模型供应商替换。</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>当前运行配置</h2>
          <span>{health ? "online" : "checking"}</span>
        </div>
        <div className="config-grid">
          <div>
            <span>模型模式</span>
            <strong>{health?.mode || "unknown"}</strong>
          </div>
          <div>
            <span>Provider</span>
            <strong>{health?.provider || "unknown"}</strong>
          </div>
          <div>
            <span>Model</span>
            <strong>{health?.model || "unknown"}</strong>
          </div>
          <div>
            <span>官网抓取</span>
            <strong>{health?.siteFetch ? "enabled" : "disabled"}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
