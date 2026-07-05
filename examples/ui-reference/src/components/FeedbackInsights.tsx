import { useMemo, useState } from "react";
import type { FeedbackInsights as FeedbackInsightsType, FeedbackListItem } from "@feedy/contracts";

export function FeedbackInsights({ insights, rows }: { insights: FeedbackInsightsType; rows: FeedbackListItem[] }) {
  const [chartView, setChartView] = useState<"weekly" | "daily">("weekly");
  const buckets = useMemo(() => createBuckets(rows, chartView), [chartView, rows]);
  const maxBucket = Math.max(...buckets.map((bucket) => Math.max(bucket.submitted, bucket.addressed)), 1);
  const resolutionRate = insights.total ? Math.round((insights.closed / insights.total) * 100) : 0;
  const triageCoverage = insights.open ? Math.round(((insights.open - insights.untriaged) / insights.open) * 100) : 100;
  const productAreas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const area = row.routePath.split("/").filter(Boolean)[0] ?? "home";
      counts.set(area, (counts.get(area) ?? 0) + 1);
    }
    return [...counts.entries()].map(([label, count]) => ({ count, label }));
  }, [rows]);

  return (
    <section className="surface" aria-labelledby="insights-title">
      <div className="section-heading">
        <div>
          <h2 id="insights-title">Feedback insights</h2>
          <p>Review queue health, triage coverage, product-area demand, and resolution progress.</p>
        </div>
      </div>

      <div className="metric-grid four">
        <Metric label="Total feedback" note={`${insights.closed} closed · ${resolutionRate}% resolved`} value={String(insights.total)} />
        <Metric label="Open" note={`${insights.closed} closed`} value={String(insights.open)} />
        <Metric label="Needs triage" note={`${triageCoverage}% open triaged`} value={String(insights.untriaged)} />
        <Metric label="Avg open age" note="Across unresolved items" value={`${Math.round((insights.averageOpenAgeHours ?? 0) / 24)}d`} />
      </div>

      <div className="chart-panel">
        <div className="chart-header">
          <div>
            <h3>{chartView === "weekly" ? "Weekly submitted vs addressed" : "Daily submitted vs addressed"}</h3>
            <p>{chartView === "weekly" ? "Last six weekly buckets" : "Last seven daily buckets"}</p>
          </div>
          <div className="chart-controls">
            <span><i /> Submitted</span>
            <span><i className="green-dot" /> Addressed</span>
            <button className={chartView === "weekly" ? "active" : ""} onClick={() => setChartView("weekly")} type="button">Weekly</button>
            <button className={chartView === "daily" ? "active" : ""} onClick={() => setChartView("daily")} type="button">Daily</button>
          </div>
        </div>
        <div className={chartView === "weekly" ? "bar-chart" : "bar-chart daily"} aria-label="Submitted versus addressed chart">
          {buckets.map((bucket) => (
            <div className="bar-column" key={bucket.label}>
              <div className="bar-pair">
                <span style={{ height: `${heightFor(bucket.submitted, maxBucket)}%` }} />
                <span style={{ height: `${heightFor(bucket.addressed, maxBucket)}%` }} />
              </div>
              <small>{bucket.label}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="breakdown-grid">
        <Breakdown title="By status" data={normaliseBreakdown(insights.byStatus)} />
        <Breakdown title="By type" data={normaliseBreakdown(insights.byType)} />
        <Breakdown title="By priority" data={normaliseBreakdown(insights.byPriority)} />
        <Breakdown title="By complexity" data={normaliseBreakdown(insights.byComplexity)} />
      </div>

      <div className="breakdown-grid single">
        <Breakdown title="By product area" data={productAreas} />
      </div>
    </section>
  );
}

function Metric({ label, note, value }: { label: string; note: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function Breakdown({ title, data }: { title: string; data: Array<{ count: number; label: string }> }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <div className="panel">
      <h3>{title}</h3>
      <div className="breakdown-list">
        {data.map((item) => (
          <div key={item.label}>
            <span>{readable(item.label)}</span>
            <div><i style={{ width: `${(item.count / max) * 100}%` }} /></div>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function createBuckets(rows: FeedbackListItem[], view: "weekly" | "daily") {
  const length = view === "weekly" ? 6 : 7;
  const ms = view === "weekly" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const end = Date.parse("2026-07-05T00:00:00.000Z");

  return Array.from({ length }, (_, index) => {
    const start = end - (length - index - 1) * ms;
    const stop = start + ms;
    const label = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: view === "weekly" ? "short" : undefined }).format(new Date(start));
    return {
      addressed: rows.filter((row) => row.addressedAt && Date.parse(row.addressedAt) >= start && Date.parse(row.addressedAt) < stop).length,
      label,
      submitted: rows.filter((row) => Date.parse(row.createdAt) >= start && Date.parse(row.createdAt) < stop).length,
    };
  });
}

function heightFor(value: number, max: number) {
  if (value === 0) return 4;
  return Math.max(10, Math.round((value / max) * 100));
}

function normaliseBreakdown(data: Record<string, number>) {
  return Object.entries(data).map(([label, count]) => ({ count, label }));
}

function readable(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
