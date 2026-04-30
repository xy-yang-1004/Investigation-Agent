import type { SupplierReport } from "../types";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="bullet-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ReportView({ report }: { report: SupplierReport }) {
  return (
    <article className="report">
      <section className="report-hero">
        <div>
          <span className="eyebrow">Supplier Research Report</span>
          <h1>{report.title}</h1>
          <p>{report.executiveSummary}</p>
        </div>
        <div className="score-card">
          <span>合作适配评分</span>
          <strong>{report.cooperationAdvice.fitScore}</strong>
          <small>/100</small>
        </div>
      </section>

      <section className="report-grid">
        <div className="panel">
          <h2>供应商概览</h2>
          <dl className="detail-list">
            <dt>名称</dt>
            <dd>{report.supplierOverview.name}</dd>
            <dt>官网</dt>
            <dd>{report.supplierOverview.website || "未提供"}</dd>
            <dt>行业</dt>
            <dd>{report.supplierOverview.industry}</dd>
            <dt>产品类别</dt>
            <dd>{report.supplierOverview.productCategory}</dd>
            <dt>定位</dt>
            <dd>{report.supplierOverview.positioning}</dd>
          </dl>
        </div>
        <div className="panel">
          <h2>产品分析</h2>
          <p className="muted-text">成熟度：{report.productAnalysis.maturity}</p>
          <h3>主要产品</h3>
          <BulletList items={report.productAnalysis.mainProducts} />
          <h3>价格信号</h3>
          <BulletList items={report.productAnalysis.pricingSignals} />
        </div>
      </section>

      <section className="report-grid">
        <div className="panel">
          <h2>优势</h2>
          <BulletList items={report.strengths} />
        </div>
        <div className="panel">
          <h2>风险</h2>
          <BulletList items={report.risks} />
        </div>
      </section>

      <section className="panel">
        <h2>竞品对比</h2>
        <div className="comparison-grid">
          {report.competitorComparison.map((item) => (
            <div className="comparison-card" key={item.name}>
              <h3>{item.name}</h3>
              <p>{item.positioning}</p>
              <div>
                <strong>优势</strong>
                <span>{item.likelyStrength}</span>
              </div>
              <div>
                <strong>劣势</strong>
                <span>{item.likelyWeakness}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>合作建议</h2>
        <p>{report.cooperationAdvice.recommendedApproach}</p>
        <div className="two-column">
          <div>
            <h3>谈判要点</h3>
            <BulletList items={report.cooperationAdvice.negotiationPoints} />
          </div>
          <div>
            <h3>下一步</h3>
            <BulletList items={report.cooperationAdvice.nextSteps} />
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>假设与来源</h2>
        <BulletList items={report.assumptions} />
        <div className="source-list">
          {report.sources.map((source) => (
            <div key={`${source.title}-${source.url || source.note}`}>
              <strong>{source.title}</strong>
              <span>{source.type} · {source.confidence}</span>
              <p>{source.note}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
