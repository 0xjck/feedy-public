import type { FeedbackInsights as FeedbackInsightsType } from "@feedy/contracts";

export function FeedbackInsights({ insights }: { insights: FeedbackInsightsType }) {
  return (
    <section className="surface" aria-labelledby="insights-title">
      <div className="section-heading">
        <div>
          <h2 id="insights-title">Feedback insights</h2>
          <p>Review queue health, triage coverage, product-area demand, and resolution progress.</p>
        </div>
      </div>

      <div className="metric-grid four">
        <Metric label="Total feedback" value={String(insights.total)} />
        <Metric label="Open" value={String(insights.open)} />
        <Metric label="Needs triage" value={String(insights.untriaged)} />
        <Metric label="Avg open age" value={`${Math.round((insights.averageOpenAgeHours ?? 0) / 24)}d`} />
      </div>

      <div className="chart-panel">
        <h3>Weekly submitted vs addressed</h3>
        <div className="bar-chart" aria-label="Weekly submitted vs addressed chart">
          {[16, 18, 20, 92, 19, 28].map((height, index) => (
            <div key={index} className="bar-pair">
              <span style={{ height: `${height}%` }} />
              <span style={{ height: `${Math.max(10, height * 0.45)}%` }} />
            </div>
          ))}
        </div>
      </div>

      <div className="breakdown-grid">
        <Breakdown title="By status" data={insights.byStatus} />
        <Breakdown title="By type" data={insights.byType} />
        <Breakdown title="By priority" data={insights.byPriority} />
        <Breakdown title="By complexity" data={insights.byComplexity} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const max = Math.max(...Object.values(data), 1);
  return (
    <div className="panel">
      <h3>{title}</h3>
      <div className="breakdown-list">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <span>{key.replace("_", " ")}</span>
            <div><i style={{ width: `${(value / max) * 100}%` }} /></div>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
