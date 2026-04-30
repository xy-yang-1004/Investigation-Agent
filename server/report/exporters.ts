import type { ResearchRun, SupplierReport } from "../types";

function list(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- 暂无";
}

function comparisonTable(report: SupplierReport) {
  if (!report.competitorComparison.length) return "暂无竞品对比。";
  return [
    "| 竞品 | 定位 | 可能优势 | 可能劣势 |",
    "| --- | --- | --- | --- |",
    ...report.competitorComparison.map(
      (item) => `| ${item.name} | ${item.positioning} | ${item.likelyStrength} | ${item.likelyWeakness} |`
    )
  ].join("\n");
}

export function reportToMarkdown(run: ResearchRun) {
  if (!run.report) throw new Error("Report is not ready.");
  const report = run.report;

  return `# ${report.title}

生成时间：${report.generatedAt}

## 执行摘要

${report.executiveSummary}

## 供应商概览

- 名称：${report.supplierOverview.name}
- 官网：${report.supplierOverview.website || "未提供"}
- 行业：${report.supplierOverview.industry}
- 产品类别：${report.supplierOverview.productCategory}
- 定位：${report.supplierOverview.positioning}

### 关键信息

${list(report.supplierOverview.facts)}

## 产品分析

- 成熟度：${report.productAnalysis.maturity}

### 主要产品

${list(report.productAnalysis.mainProducts)}

### 价格信号

${list(report.productAnalysis.pricingSignals)}

### 目标客户

${list(report.productAnalysis.targetCustomers)}

## 优势

${list(report.strengths)}

## 风险

${list(report.risks)}

## 竞品对比

${comparisonTable(report)}

## 合作建议

- 适配评分：${report.cooperationAdvice.fitScore}/100
- 推荐策略：${report.cooperationAdvice.recommendedApproach}

### 谈判要点

${list(report.cooperationAdvice.negotiationPoints)}

### 下一步

${list(report.cooperationAdvice.nextSteps)}

## 假设与待验证事项

${list(report.assumptions)}

## 来源

${report.sources
  .map((source) => `- ${source.title}${source.url ? `：${source.url}` : ""}（${source.type}，${source.confidence}）- ${source.note}`)
  .join("\n")}

## API 调用摘要

- 调用次数：${run.usage.length}
- 使用模型：${Array.from(new Set(run.usage.map((item) => item.model))).join(", ") || "无"}
- 执行步骤：${run.steps.map((step) => `${step.title}=${step.status}`).join("；")}
`;
}

export function reportToJson(run: ResearchRun) {
  if (!run.report) throw new Error("Report is not ready.");
  return JSON.stringify(
    {
      report: run.report,
      input: run.input,
      target: run.target,
      plan: run.plan,
      usage: run.usage,
      generatedBy: "SupplierScope AI"
    },
    null,
    2
  );
}
