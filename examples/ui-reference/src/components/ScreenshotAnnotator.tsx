import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { FeedbackAnnotationDraft } from "../data/seedFeedback";

const spendTarget: FeedbackAnnotationDraft = {
  height: 0.24,
  id: "annotator-target-1",
  index: 1,
  label: "Spend metric",
  note: "The metric does not match the table total.",
  selector: "article[data-metric='spend']",
  tagName: "article",
  width: 0.26,
  x: 0.04,
  y: 0.56,
};

const validFetchesTarget: FeedbackAnnotationDraft = {
  height: 0.28,
  id: "annotator-target-2",
  index: 2,
  label: "Valid fetches metric",
  note: "This is the number the user expected to reconcile.",
  selector: "article[data-metric='valid-fetches']",
  tagName: "article",
  width: 0.26,
  x: 0.33,
  y: 0.14,
};

const pausedStatusTarget: FeedbackAnnotationDraft = {
  height: 0.16,
  id: "annotator-target-3",
  index: 3,
  label: "Paused status",
  note: "The campaign row status conflicts with the header state.",
  selector: "tr[data-campaign='paused'] td[data-status]",
  tagName: "td",
  width: 0.18,
  x: 0.45,
  y: 0.55,
};

const targets = [spendTarget, validFetchesTarget, pausedStatusTarget];

export function ScreenshotAnnotator() {
  const [annotations, setAnnotations] = useState<FeedbackAnnotationDraft[]>(targets.slice(0, 2));

  function toggleAnnotation(target: FeedbackAnnotationDraft) {
    setAnnotations((current) => {
      if (current.some((annotation) => annotation.id === target.id)) {
        return current.filter((annotation) => annotation.id !== target.id).map((annotation, index) => ({ ...annotation, index: index + 1 }));
      }
      return [...current, { ...target, index: current.length + 1 }];
    });
  }

  return (
    <section className="surface" aria-labelledby="annotator-title">
      <div className="section-heading">
        <div>
          <h2 id="annotator-title">Screenshot annotation</h2>
          <p>Let users mark the exact part of the interface that needs attention.</p>
        </div>
        <button className="secondary-button" onClick={() => setAnnotations([])} type="button">
          <RotateCcw size={14} />
          Clear
        </button>
      </div>
      <div className="annotator-canvas">
        <div className="mock-app-bar">Performance</div>
        <div className="metric-grid">
          <button
            className="metric-card"
            onClick={() => toggleAnnotation(spendTarget)}
            type="button"
          >
            <span>Spend</span>
            <strong>$18,573</strong>
          </button>
          <button
            className="metric-card selected"
            onClick={() => toggleAnnotation(validFetchesTarget)}
            type="button"
          >
            <span>Valid fetches</span>
            <strong>53,737</strong>
          </button>
          <div className="metric-card">
            <span>Fill rate</span>
            <strong>51%</strong>
          </div>
        </div>
        <div className="chart-row">
          <div />
          <div />
          <div />
        </div>
        <div className="campaign-table-preview">
          <span>Campaign</span>
          <span>Status</span>
          <span>Spend</span>
          <strong>AI Code Agent</strong>
          <button onClick={() => toggleAnnotation(pausedStatusTarget)} type="button">Paused</button>
          <strong>$1,540</strong>
        </div>
        {annotations.map((annotation) => (
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
      <div className="floating-toolbar annotator-toolbar">
        <span>{annotations.length ? `${annotations.length} annotations selected.` : "Click page elements to annotate."}</span>
        <button className="secondary-button" onClick={() => setAnnotations([])} type="button">
          <X size={14} />
          Cancel
        </button>
        <button className="primary-button" type="button">
          <Check size={14} />
          Done
        </button>
      </div>
    </section>
  );
}
