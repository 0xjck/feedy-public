import { useEffect, useState } from "react";
import type { FeedbackComplexity, FeedbackPriority, FeedbackStatus, FeedbackType, RoadmapStatus } from "@feedy/contracts";
import { Crosshair, ExternalLink, Monitor } from "lucide-react";
import { Badge } from "./Badge";
import {
  complexityOptions,
  labelForRoadmap,
  labelForStatus,
  labelForType,
  priorityOptions,
  roadmapOptions,
  statusOptions,
  type ExampleFeedbackDetail,
  typeOptions,
} from "../data/seedFeedback";

type DetailUpdate = Partial<{
  assignedUserId: string | undefined;
  complexity: FeedbackComplexity | undefined;
  isRoadmapItem: boolean;
  priority: FeedbackPriority | undefined;
  roadmapStatus: RoadmapStatus | undefined;
  status: FeedbackStatus;
  title: string | undefined;
  type: FeedbackType;
}>;

const assigneeOptions = [
  { label: "Unassigned", value: "unassigned" },
  { label: "Triage agent", value: "agent_triage" },
  { label: "Backlog agent", value: "agent_backlog" },
  { label: "Storage agent", value: "agent_storage" },
];

export function FeedbackDetail({
  feedback,
  onAddNote,
  onUpdate,
}: {
  feedback: ExampleFeedbackDetail;
  onAddNote: (id: string, body: string) => void;
  onUpdate: (id: string, update: DetailUpdate) => void;
}) {
  const [note, setNote] = useState("");
  const [title, setTitle] = useState(feedback.title ?? "");

  useEffect(() => {
    setTitle(feedback.title ?? "");
  }, [feedback.id, feedback.title]);

  function saveTitle() {
    onUpdate(feedback.id, { title: title.trim() || undefined });
  }

  function addNote() {
    if (!note.trim()) return;
    onAddNote(feedback.id, note.trim());
    setNote("");
  }

  return (
    <section className="surface" aria-labelledby="detail-title">
      <div className="section-heading">
        <div>
          <h2 id="detail-title">Feedback detail</h2>
          <p>Review submitted context, screenshots, annotations, activity, and triage state.</p>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="panel">
            <div className="badge-row">
              <Badge>{labelForType(feedback.type)}</Badge>
              <Badge>{labelForStatus(feedback.status)}</Badge>
              <Badge>{feedback.priority ?? "Unprioritized"}</Badge>
              <Badge>{feedback.complexity ?? "Unscored"}</Badge>
            </div>
            <label className="title-editor">
              <span>Optional roadmap title</span>
              <input onChange={(event) => setTitle(event.target.value)} placeholder="Short roadmap title" value={title} />
              <button className="secondary-button compact" onClick={saveTitle} type="button">Save title</button>
            </label>
            <p>{feedback.description}</p>
          </div>

          <div className="panel">
            <h3>Screenshot</h3>
            {feedback.hasScreenshot ? (
              <ScreenshotFrame feedback={feedback} />
            ) : (
              <div className="empty-state">No screenshot was captured for this feedback item.</div>
            )}
          </div>

          <div className="panel">
            <h3 className="icon-heading">
              <Crosshair size={16} />
              Annotations
            </h3>
            {feedback.annotations.length ? (
              <div className="annotation-list">
                {feedback.annotations.map((annotation) => (
                  <div key={annotation.id}>
                    <strong>{annotation.index}</strong>
                    <span>{annotation.tagName}</span>
                    <p>{annotation.note ?? annotation.label}</p>
                    <code>{annotation.selector}</code>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No annotations were added.</p>
            )}
          </div>

          <div className="panel">
            <h3>Notes</h3>
            <div className="note-composer">
              <textarea onChange={(event) => setNote(event.target.value)} placeholder="Add an internal note" value={note} />
              <button className="primary-button" disabled={!note.trim()} onClick={addNote} type="button">Add note</button>
            </div>
            {feedback.notes.length ? (
              feedback.notes.map((item) => (
                <article className="note" key={item.id}>
                  <p>{item.body}</p>
                  <small>{item.authorLabel ?? "Internal"} · {formatDateTime(item.createdAt)}</small>
                </article>
              ))
            ) : (
              <p className="muted">No notes yet.</p>
            )}
          </div>

          <div className="panel">
            <h3>Activity</h3>
            {feedback.activity.map((event) => (
              <article className="activity-line" key={event.id}>
                <strong>{event.event.replaceAll("_", " ")}</strong>
                <span>{event.actorLabel ?? "System"} · {formatDateTime(event.createdAt)}</span>
              </article>
            ))}
          </div>
        </div>

        <aside className="detail-side">
          <div className="panel">
            <div className="side-panel-title">
              <div>
                <h3>Roadmap</h3>
                <p>Promote this item to implementation planning.</p>
              </div>
              <Badge>{feedback.isRoadmapItem ? labelForRoadmap(feedback.roadmapStatus) : "Not on roadmap"}</Badge>
            </div>
            <DetailSelect
              label="Roadmap status"
              onChange={(value) =>
                onUpdate(feedback.id, {
                  isRoadmapItem: value !== "none",
                  roadmapStatus: value === "none" ? undefined : (value as RoadmapStatus),
                })
              }
              options={roadmapOptions}
              value={feedback.isRoadmapItem ? feedback.roadmapStatus ?? "future" : "none"}
            />
            {feedback.roadmapStatus === "just_released" ? (
              <div className="feature-flag-box">
                <strong>Feature flag placeholder</strong>
                <code>{feedback.featureFlagKey ?? featureFlagKeyFor(feedback)}</code>
              </div>
            ) : null}
          </div>

          <div className="panel">
            <h3>Triage</h3>
            <DetailSelect
              label="Status"
              onChange={(value) => onUpdate(feedback.id, { status: value as FeedbackStatus })}
              options={statusOptions}
              value={feedback.status}
            />
            <DetailSelect
              label="Type"
              onChange={(value) => onUpdate(feedback.id, { type: value as FeedbackType })}
              options={typeOptions}
              value={feedback.type}
            />
            <DetailSelect
              label="Priority"
              onChange={(value) => onUpdate(feedback.id, { priority: value === "none" ? undefined : (value as FeedbackPriority) })}
              options={priorityOptions}
              value={feedback.priority ?? "none"}
            />
            <DetailSelect
              label="Complexity"
              onChange={(value) => onUpdate(feedback.id, { complexity: value === "none" ? undefined : (value as FeedbackComplexity) })}
              options={complexityOptions}
              value={feedback.complexity ?? "none"}
            />
            <DetailSelect
              label="Assignee"
              onChange={(value) => onUpdate(feedback.id, { assignedUserId: value === "unassigned" ? undefined : value })}
              options={assigneeOptions}
              value={feedback.assignedUserId ?? "unassigned"}
            />
          </div>

          <div className="panel">
            <h3>Context</h3>
            <Field label="Submitted" value={formatDateTime(feedback.createdAt)} />
            <Field label="Page" value={feedback.pageLabel ?? "Unknown"} />
            <Field label="Route" value={feedback.routePath} mono />
            <Field label="Environment" value={feedback.environment} />
            <Field label="Release" value={feedback.release ?? "Unknown"} />
            <Field label="ID" value={feedback.id} mono />
            {feedback.sourceUrl ? (
              <a className="external-link" href={feedback.sourceUrl} rel="noreferrer" target="_blank">
                Open source URL <ExternalLink size={13} />
              </a>
            ) : null}
          </div>

          <div className="panel">
            <h3 className="icon-heading">
              <Monitor size={16} />
              Technical
            </h3>
            <Field
              label="Viewport"
              value={
                feedback.technicalInfo.viewportWidth && feedback.technicalInfo.viewportHeight
                  ? `${feedback.technicalInfo.viewportWidth}x${feedback.technicalInfo.viewportHeight}`
                  : "Unknown"
              }
            />
            <Field label="Browser" mono value={feedback.technicalInfo.userAgent ?? "Unknown"} />
            <Field label="Timezone" value={feedback.technicalInfo.timezone ?? "Unknown"} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function ScreenshotFrame({ feedback }: { feedback: ExampleFeedbackDetail }) {
  return (
    <div className="screenshot-frame">
      <div className="mock-app-bar">{feedback.pageLabel ?? "Product page"}</div>
      <div className="metric-grid">
        <div className="metric-card"><span>Open work</span><strong>14</strong></div>
        <div className="metric-card selected"><span>Agent-ready</span><strong>9</strong></div>
        <div className="metric-card"><span>Resolved</span><strong>32</strong></div>
      </div>
      <div className="form-preview">
        <span>Project name</span>
        <div />
        <span>Save changes</span>
      </div>
      {feedback.annotations.map((annotation) => (
        <div
          className="screenshot-annotation"
          key={annotation.id}
          style={{
            height: `${annotation.height * 100}%`,
            left: `${annotation.x * 100}%`,
            top: `${annotation.y * 100}%`,
            width: `${annotation.width * 100}%`,
          }}
        >
          <span>{annotation.index}</span>
        </div>
      ))}
    </div>
  );
}

function DetailSelect({
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
    <label className="field-row">
      <span>{label}</span>
      <select aria-label={label} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Field({ label, mono = false, value }: { label: string; mono?: boolean; value: string }) {
  return (
    <div className="field-row">
      <span>{label}</span>
      <strong className={mono ? "mono-value" : ""}>{value}</strong>
    </div>
  );
}

function featureFlagKeyFor(feedback: ExampleFeedbackDetail) {
  return `feedy_${(feedback.title ?? feedback.id).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 48)}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}
