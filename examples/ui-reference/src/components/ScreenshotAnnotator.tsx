import { Check, X } from "lucide-react";

export function ScreenshotAnnotator() {
  return (
    <section className="surface" aria-labelledby="annotator-title">
      <div className="section-heading">
        <div>
          <h2 id="annotator-title">Screenshot annotation</h2>
          <p>Let users mark the exact part of the interface that needs attention.</p>
        </div>
      </div>
      <div className="annotator-canvas">
        <div className="annotation-target annotation-target-one">
          <span>1</span>
        </div>
        <div className="annotation-target annotation-target-two">
          <span>2</span>
        </div>
        <div className="mock-app-bar">Performance</div>
        <div className="metric-grid">
          <div className="metric-card">
            <span>Spend</span>
            <strong>$18,573</strong>
          </div>
          <div className="metric-card selected">
            <span>Valid fetches</span>
            <strong>53,737</strong>
          </div>
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
      </div>
      <div className="floating-toolbar">
        <span>Click page elements to annotate.</span>
        <button type="button" className="secondary-button">
          <X size={14} /> Cancel
        </button>
        <button type="button" className="primary-button">
          <Check size={14} /> Done
        </button>
      </div>
    </section>
  );
}
