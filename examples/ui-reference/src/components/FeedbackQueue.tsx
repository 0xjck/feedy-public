import { useMemo, useState } from "react";
import type { FeedbackComplexity, FeedbackListItem, FeedbackPriority, FeedbackStatus, RoadmapStatus } from "@feedy/contracts";
import { Copy, Crosshair, Image as ImageIcon, Search } from "lucide-react";
import { Badge } from "./Badge";
import {
  complexityOptions,
  labelForRoadmap,
  labelForStatus,
  labelForType,
  priorityOptions,
  roadmapOptions,
  statusOptions,
  typeOptions,
} from "../data/seedFeedback";

type QueueUpdate = Partial<{
  complexity: FeedbackComplexity | undefined;
  isRoadmapItem: boolean;
  priority: FeedbackPriority | undefined;
  roadmapStatus: RoadmapStatus | undefined;
  status: FeedbackStatus;
}>;

export function FeedbackQueue({
  onSelect,
  onUpdate,
  rows,
  selectedId,
}: {
  onSelect: (id: string) => void;
  onUpdate: (id: string, update: QueueUpdate) => void;
  rows: FeedbackListItem[];
  selectedId: string;
}) {
  const [priorityFilter, setPriorityFilter] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      if (typeFilter && row.type !== typeFilter) return false;
      if (priorityFilter && row.priority !== priorityFilter) return false;
      if (!needle) return true;
      return [row.description, row.title, row.pageLabel, row.routePath, row.userEmail, row.orgLabel]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [priorityFilter, query, rows, statusFilter, typeFilter]);
  const open = rows.filter((row) => !["resolved", "dismissed"].includes(row.status));
  const screenshots = rows.filter((row) => row.hasScreenshot).length;
  const untriaged = open.filter((row) => !row.priority || !row.complexity || !row.assignedUserId).length;
  const closed = rows.length - open.length;

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
        <Metric label="Total feedback" note={`${closed} closed`} value={String(rows.length)} />
        <Metric label="Open" note="Needs review" value={String(open.length)} />
        <Metric label="Untriaged" note="Missing score or owner" value={String(untriaged)} />
        <Metric label="Screenshots" note="Captured evidence" value={String(screenshots)} />
      </div>

      <div className="filter-bar">
        <label className="search-field">
          <Search size={16} />
          <input onChange={(event) => setQuery(event.target.value)} placeholder="Description, page, user" value={query} />
        </label>
        <select aria-label="Status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
          <option value="">All statuses</option>
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select aria-label="Type" onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}>
          <option value="">All types</option>
          {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select aria-label="Priority" onChange={(event) => setPriorityFilter(event.target.value)} value={priorityFilter}>
          <option value="">All priorities</option>
          {priorityOptions.filter((option) => option.value !== "none").map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
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
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr className={row.id === selectedId ? "selected-row" : ""} key={row.id}>
                <td>
                  <button className="row-link" onClick={() => onSelect(row.id)} type="button">
                    <span className="row-title">
                      <Badge>{labelForType(row.type)}</Badge>
                      {row.hasScreenshot ? <ImageIcon aria-label="Has screenshot" size={14} /> : null}
                      {row.annotationCount ? (
                        <span className="annotation-count">
                          <Crosshair size={13} />
                          {row.annotationCount}
                        </span>
                      ) : null}
                      {row.isRoadmapItem ? <Badge tone="green">Roadmap: {labelForRoadmap(row.roadmapStatus)}</Badge> : null}
                    </span>
                    <strong>{row.title ?? row.description}</strong>
                    <span className="muted inline-id">{row.id.slice(0, 8)} <Copy size={12} /></span>
                  </button>
                </td>
                <td>
                  <QuickSelect
                    label="Roadmap"
                    onChange={(value) =>
                      onUpdate(row.id, {
                        isRoadmapItem: value !== "none",
                        roadmapStatus: value === "none" ? undefined : (value as RoadmapStatus),
                      })
                    }
                    options={roadmapOptions}
                    value={row.isRoadmapItem ? row.roadmapStatus ?? "future" : "none"}
                  />
                </td>
                <td>
                  <strong>{row.pageLabel ?? "Unknown"}</strong>
                  <span className="muted">{row.routePath}</span>
                </td>
                <td>
                  <QuickSelect
                    label="Status"
                    onChange={(value) => onUpdate(row.id, { status: value as FeedbackStatus })}
                    options={statusOptions}
                    value={row.status}
                  />
                </td>
                <td>
                  <QuickSelect
                    label="Priority"
                    onChange={(value) => onUpdate(row.id, { priority: value === "none" ? undefined : (value as FeedbackPriority) })}
                    options={priorityOptions}
                    value={row.priority ?? "none"}
                  />
                </td>
                <td>
                  <QuickSelect
                    label="Complexity"
                    onChange={(value) => onUpdate(row.id, { complexity: value === "none" ? undefined : (value as FeedbackComplexity) })}
                    options={complexityOptions}
                    value={row.complexity ?? "none"}
                  />
                </td>
                <td>{formatDate(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

function QuickSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="quick-select">
      <span>{label}</span>
      <select aria-label={label} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));
}
