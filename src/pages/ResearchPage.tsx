import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { createResearchRun } from "../api";
import type { ResearchInput } from "../types";

const sampleInput: ResearchInput = {
  target: "Acme Robotics",
  industry: "智能制造",
  productCategory: "仓储自动化机器人",
  url: "https://example.com",
  language: "zh-CN"
};

export function ResearchPage({ onCreated }: { onCreated: (id: string) => void }) {
  const [form, setForm] = useState<ResearchInput>({ target: "", language: "zh-CN" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof ResearchInput>(key: K, value: ResearchInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const run = await createResearchRun(form);
      onCreated(run.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack narrow-page">
      <section className="page-heading">
        <span className="eyebrow">Create research task</span>
        <h1>新建供应商调研</h1>
        <p>输入任意一种线索即可启动 Agent。信息越完整，报告中的假设越少，后续询价和核验路径也更明确。</p>
      </section>

      <form className="panel research-form" onSubmit={onSubmit}>
        <label>
          <span>供应商名称、产品类别或官网 URL</span>
          <input
            value={form.target}
            onChange={(event) => update("target", event.target.value)}
            placeholder="例如：Acme Robotics / 仓储自动化机器人 / https://example.com"
          />
        </label>
        <div className="form-grid">
          <label>
            <span>行业</span>
            <input value={form.industry || ""} onChange={(event) => update("industry", event.target.value)} placeholder="例如：智能制造" />
          </label>
          <label>
            <span>产品类型</span>
            <input
              value={form.productCategory || ""}
              onChange={(event) => update("productCategory", event.target.value)}
              placeholder="例如：仓储自动化机器人"
            />
          </label>
        </div>
        <label>
          <span>官网 URL（可选）</span>
          <input value={form.url || ""} onChange={(event) => update("url", event.target.value)} placeholder="https://supplier.example" />
        </label>

        {error && <div className="error-box">{error}</div>}

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={() => setForm(sampleInput)}>
            <Sparkles size={18} /> 填入示例
          </button>
          <button className="secondary-button" type="button" onClick={() => setForm({ target: "", language: "zh-CN" })}>
            <RotateCcw size={18} /> 清空
          </button>
          <button className="primary-button" type="submit" disabled={loading}>
            <ArrowRight size={18} /> {loading ? "创建中" : "启动 Agent"}
          </button>
        </div>
      </form>
    </div>
  );
}
