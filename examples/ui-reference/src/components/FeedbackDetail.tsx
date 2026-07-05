import type { FeedbackDetail as FeedbackDetailType } from "@feedy/contracts";
import { Badge } from "./Badge";

export function FeedbackDetail({ feedback }: { feedback: FeedbackDetailType }) {
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
              <Badge>{feedback.type}</Badge>
              <Badge>{feedback.status}</Badge>
              <Badge>{feedback.priority ?? "Unprioritized"}</Badge>
              <Badge>{feedback.complexity ?? "Unscored"}</Badge>
            </div>
            <h3>{feedback.title}</h3>
            <p>{feedback.description}</p>
          </div>

          <div className="panel">
            <h3>Screenshot</h3>
            <div className="screenshot-frame">
              {feedback.annotations.map((annotation, index) => (
                <div
                  key={annotation.id}
                  className="screenshot-annotation"
                  style={{
                    left: `${annotation.x * 100}%`,
                    top: `${annotation.y * 100}%`,
                    width: `${(annotation.width ?? 0.12) * 100}%`,
                    height: `${(annotation.height ?? 0.08) * 100}%`,
                  }}
                >
                  <span>{index + 1}</span>
                </div>
              ))}
              <div className="mock-app-bar">Project settings</div>
              <div className="metric-grid">
                <div className="metric-card selected"><span>Project title</span><strong>Acme Studio</strong></div>
                <div className="metric-card"><span>Members</span><strong>12</strong></div>
                <div className="metric-card"><span>Integrations</span><strong>4</strong></div>
              </div>
              <div className="form-preview">
                <span>Project name</span>
                <div />
                <span>Save changes</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Annotations</h3>
            <div className="annotation-list">
              {feedback.annotations.map((annotation, index) => (
                <div key={annotation.id}>
                  <strong>{index + 1}</strong>
                  <span>{annotation.label}</span>
                  <p>{annotation.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>Notes</h3>
            {feedback.notes.map((note) => (
              <p key={note.id} className="note">{note.body}</p>
            ))}
          </div>
        </div>

        <aside className="detail-side">
          <div className="panel">
            <h3>Triage</h3>
            <Field label="Status" value={feedback.status} />
            <Field label="Priority" value={feedback.priority ?? "Unprioritized"} />
            <Field label="Complexity" value={feedback.complexity ?? "Unscored"} />
            <Field label="Assignee" value={feedback.assignedUserId ?? "Unassigned"} />
          </div>
          <div className="panel">
            <h3>Context</h3>
            <Field label="Page" value={feedback.pageLabel ?? "Unknown"} />
            <Field label="Route" value={feedback.routePath} />
            <Field label="Environment" value={feedback.environment} />
            <Field label="Release" value={feedback.release ?? "Unknown"} />
          </div>
          <div className="panel">
            <h3>Activity</h3>
            {feedback.activity.map((activity) => (
              <p key={activity.id} className="activity-line">{activity.event.replaceAll("_", " ")}</p>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="field-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
