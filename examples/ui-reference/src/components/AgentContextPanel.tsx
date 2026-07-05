import type { AgentFeedbackContext } from "@feedy/contracts";

export function AgentContextPanel({ context }: { context: AgentFeedbackContext }) {
  return (
    <section className="surface" aria-labelledby="agent-title">
      <div className="section-heading">
        <div>
          <h2 id="agent-title">Agent context</h2>
          <p>The same feedback record rendered as structured implementation context.</p>
        </div>
      </div>

      <pre className="code-panel">
        {JSON.stringify(
          {
            feedbackId: context.feedback.id,
            summary: context.summary,
            reproductionContext: context.reproductionContext,
            implementationHints: context.implementationHints,
            annotations: context.feedback.annotations.map((annotation) => ({
              label: annotation.label,
              note: annotation.note,
            })),
          },
          null,
          2,
        )}
      </pre>
    </section>
  );
}
