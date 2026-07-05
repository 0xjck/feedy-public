import type { FeedbackListItem } from "@feedy/contracts";
import { Copy, Search } from "lucide-react";
import { Badge } from "./Badge";

export function FeedbackQueue({ rows }: { rows: FeedbackListItem[] }) {
  return (
    <section className="surface" aria-labelledby="queue-title">
      <div className="section-heading">
        <div>
          <h2 id="queue-title">Feedback queue</h2>
          <p>Triage product bugs, ideas, requests, and annotated screenshots.</p>
        </div>
        <button type="button" className="secondary-button">View insights</button>
      </div>

      <div className="metric-grid four">
        <Metric label="Total feedback" value="24" note="10 closed" />
        <Metric label="Open" value="14" note="Needs review" />
        <Metric label="Untriaged" value="5" note="Missing score" />
        <Metric label="Screenshots" value="9" note="Annotated evidence" />
      </div>

      <div className="filter-bar">
        <label className="search-field">
          <Search size={16} />
          <input placeholder="Description, page, user" />
        </label>
        <select aria-label="Status"><option>Open</option></select>
        <select aria-label="Type"><option>All types</option></select>
        <select aria-label="Priority"><option>All priorities</option></select>
        <button type="button" className="primary-button">Filter</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Feedback</th>
              <th>Roadmap</th>
              <th>Page</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Complexity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="row-title">
                    <Badge>{capitalize(row.type)}</Badge>
                    {row.isRoadmapItem && row.roadmapStatus ? <Badge tone="green">Roadmap: {row.roadmapStatus}</Badge> : null}
                  </div>
                  <strong>{row.title ?? row.description}</strong>
                  <span className="muted inline-id">{row.id.slice(0, 8)} <Copy size={12} /></span>
                </td>
                <td>{row.roadmapStatus ?? "-"}</td>
                <td><strong>{row.pageLabel ?? "Unknown"}</strong><span className="muted">{row.routePath}</span></td>
                <td>{capitalize(row.status.replace("_", " "))}</td>
                <td>{row.priority ?? "Unprioritized"}</td>
                <td>{row.complexity ?? "Unscored"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
