import type { AgentFeedbackContext } from "@feedy/contracts";

export function AgentContextPanel({ context }: { context: AgentFeedbackContext }) {
  const payload = {
    annotations: context.feedback.annotations.map((annotation) => ({
      label: annotation.label,
      note: annotation.note,
      rect: {
        height: annotation.height,
        width: annotation.width,
        x: annotation.x,
        y: annotation.y,
      },
    })),
    feedbackId: context.feedback.id,
    implementationHints: context.implementationHints,
    reproductionContext: context.reproductionContext,
    summary: context.summary,
  };

  return (
    <section className="surface" aria-labelledby="agent-title">
      <div className="section-heading">
        <div>
          <h2 id="agent-title">Agent context</h2>
          <p>The same feedback record rendered as structured implementation context.</p>
        </div>
      </div>

      <div className="agent-context-grid">
        <div className="panel">
          <h3>Task brief</h3>
          <p>{context.summary}</p>
          <Field label="Priority" value={context.implementationHints.priority ?? "Unprioritized"} />
          <Field label="Complexity" value={context.implementationHints.complexity ?? "Unscored"} />
          <Field label="Suggested next action" value={context.implementationHints.suggestedNextAction ?? "Review feedback detail."} />
        </div>

        <div className="panel">
          <h3>Reproduction context</h3>
          <Field label="Route" value={context.reproductionContext.routePath} mono />
          <Field label="Environment" value={context.reproductionContext.environment} />
          <Field label="Release" value={context.reproductionContext.release ?? "Unknown"} />
          <Field label="Viewport" value={context.reproductionContext.viewport ?? "Unknown"} />
          <Field label="Browser" value={context.reproductionContext.browser ?? "Unknown"} mono />
        </div>
      </div>

      <div className="panel">
        <h3>Evidence</h3>
        <div className="agent-evidence-list">
          {context.feedback.annotations.length ? (
            context.feedback.annotations.map((annotation, index) => (
              <article key={annotation.id}>
                <strong>{index + 1}</strong>
                <div>
                  <span>{annotation.label ?? "Annotation"}</span>
                  <p>{annotation.note ?? "No note supplied."}</p>
                </div>
              </article>
            ))
          ) : (
            <p className="muted">No annotations were submitted.</p>
          )}
        </div>
      </div>

      <pre className="code-panel">{JSON.stringify(payload, null, 2)}</pre>
    </section>
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
