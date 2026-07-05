import { Bug, HelpCircle, Lightbulb, MessageCircle, Send, X } from "lucide-react";
import { Badge } from "./Badge";

const types = [
  { label: "Bug", icon: Bug, active: true },
  { label: "Idea", icon: Lightbulb },
  { label: "Question", icon: HelpCircle },
  { label: "Request", icon: MessageCircle },
  { label: "General", icon: MessageCircle },
];

export function FeedbackWidget() {
  return (
    <section className="surface demo-backdrop" aria-labelledby="widget-title">
      <div className="demo-page" aria-hidden="true">
        <div className="demo-page-header">
          <strong>Project settings</strong>
          <Badge tone="green">Live</Badge>
        </div>
        <div className="metric-grid">
          <div className="metric-card selected">
            <span>Active users</span>
            <strong>1,284</strong>
          </div>
          <div className="metric-card">
            <span>Open reports</span>
            <strong>14</strong>
          </div>
          <div className="metric-card">
            <span>Agent-ready</span>
            <strong>9</strong>
          </div>
        </div>
      </div>

      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 id="widget-title">Send feedback</h2>
            <p>Include the page, browser context, and optional annotations so the issue is easy to reproduce.</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close feedback">
            <X size={18} />
          </button>
        </div>

        <div className="field">
          <label>Type</label>
          <div className="segmented">
            {types.map((type) => {
              const Icon = type.icon;
              return (
                <button key={type.label} type="button" className={type.active ? "active" : ""}>
                  <Icon size={15} />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label htmlFor="feedback-description">Description</label>
          <textarea id="feedback-description" placeholder="What happened, what did you expect, or what would help?" />
          <span className="field-hint">0/5000 characters</span>
        </div>

        <div className="field">
          <label htmlFor="feedback-video">Video link optional</label>
          <input id="feedback-video" placeholder="https://www.loom.com/share/..." />
        </div>

        <div className="callout-row">
          <span>Optional screenshot annotation may include visible page content.</span>
          <button type="button" className="secondary-button">
            Annotate screen
          </button>
        </div>

        <footer className="modal-actions">
          <button type="button" className="secondary-button">
            Cancel
          </button>
          <button type="button" className="primary-button">
            <Send size={15} />
            Send feedback
          </button>
        </footer>
      </div>
    </section>
  );
}
