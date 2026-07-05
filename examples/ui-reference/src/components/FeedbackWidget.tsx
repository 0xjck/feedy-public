import { useMemo, useState } from "react";
import { Bug, Check, Crosshair, HelpCircle, Image as ImageIcon, Lightbulb, MessageCircle, MessageSquare, Send, X } from "lucide-react";
import type { FeedbackType } from "@feedy/contracts";
import { type FeedbackAnnotationDraft, typeOptions } from "../data/seedFeedback";
import { Badge } from "./Badge";

export type SubmittedFeedback = {
  annotations: FeedbackAnnotationDraft[];
  description: string;
  type: FeedbackType;
  videoLink: string;
};

const defaultAnnotations: FeedbackAnnotationDraft[] = [
  {
    height: 0.2,
    id: "draft-annotation-1",
    index: 1,
    label: "Save button",
    note: "This remains disabled after the title changes.",
    selector: "button[data-save-project]",
    tagName: "button",
    width: 0.23,
    x: 0.56,
    y: 0.26,
  },
  {
    height: 0.18,
    id: "draft-annotation-2",
    index: 2,
    label: "Form summary",
    note: "No validation message appears for the user.",
    selector: "section[data-settings-summary]",
    tagName: "section",
    width: 0.34,
    x: 0.09,
    y: 0.65,
  },
];

const iconByType = {
  bug: Bug,
  general: MessageCircle,
  idea: Lightbulb,
  question: HelpCircle,
  request: MessageSquare,
} satisfies Record<FeedbackType, typeof Bug>;

export function FeedbackWidget({ onSubmit }: { onSubmit: (feedback: SubmittedFeedback) => void }) {
  const [annotations, setAnnotations] = useState<FeedbackAnnotationDraft[]>([]);
  const [description, setDescription] = useState("");
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [videoLink, setVideoLink] = useState("");
  const canSubmit = description.trim().length >= 10;
  const characterCount = useMemo(() => `${description.trim().length}/5000 characters`, [description]);

  function finishAnnotation() {
    setAnnotations(defaultAnnotations);
    setIsAnnotating(false);
  }

  function submit() {
    if (!canSubmit) return;
    onSubmit({ annotations, description: description.trim(), type, videoLink });
    setAnnotations([]);
    setDescription("");
    setType("bug");
    setVideoLink("");
  }

  return (
    <section className="surface demo-backdrop" aria-labelledby="widget-title">
      <div className={isAnnotating ? "demo-page annotating" : "demo-page"} aria-hidden={!isAnnotating}>
        <div className="demo-page-header">
          <strong>Project settings</strong>
          <Badge tone="green">Live</Badge>
        </div>
        <div className="metric-grid">
          <button className="metric-card selected annotation-source annotation-source-one" type="button">
            <span>Project title</span>
            <strong>Acme Studio</strong>
          </button>
          <button className="metric-card annotation-source annotation-source-two" type="button">
            <span>Open reports</span>
            <strong>14</strong>
          </button>
          <div className="metric-card">
            <span>Agent-ready</span>
            <strong>9</strong>
          </div>
        </div>
        <div className="settings-form-preview">
          <label>
            Project name
            <input defaultValue="Acme Studio" />
          </label>
          <button disabled type="button">Save changes</button>
        </div>
      </div>

      {isAnnotating ? (
        <>
          <div className="annotation-target annotation-target-one">
            <span>1</span>
          </div>
          <div className="annotation-target annotation-target-two">
            <span>2</span>
          </div>
          <div className="floating-toolbar annotation-toolbar">
            <span>Click page elements to annotate.</span>
            <button className="secondary-button" onClick={() => setIsAnnotating(false)} type="button">
              <X size={14} />
              Cancel
            </button>
            <button className="primary-button" onClick={finishAnnotation} type="button">
              <Check size={14} />
              Done
            </button>
          </div>
        </>
      ) : null}

      <div className={isAnnotating ? "modal hidden-while-annotating" : "modal"}>
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
            {typeOptions.map((option) => {
              const Icon = iconByType[option.value];
              return (
                <button
                  aria-pressed={type === option.value}
                  className={type === option.value ? "active" : ""}
                  key={option.value}
                  onClick={() => setType(option.value)}
                  type="button"
                >
                  <Icon size={15} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label htmlFor="feedback-description">Description</label>
          <textarea
            id="feedback-description"
            maxLength={5000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What happened, what did you expect, or what would help?"
            value={description}
          />
          <span className="field-hint">{characterCount}</span>
        </div>

        <div className="field">
          <label htmlFor="feedback-video">Video link optional</label>
          <input
            id="feedback-video"
            onChange={(event) => setVideoLink(event.target.value)}
            placeholder="https://www.loom.com/share/..."
            value={videoLink}
          />
        </div>

        <div className="callout-row screenshot-callout">
          {annotations.length ? (
            <div className="screenshot-preview">
              <div className="screenshot-preview-header">
                <span>
                  <ImageIcon size={15} />
                  Screenshot with {annotations.length} annotations
                </span>
                <button className="secondary-button compact" onClick={() => setIsAnnotating(true)} type="button">
                  <Crosshair size={14} />
                  Re-annotate
                </button>
              </div>
              <MiniScreenshot annotations={annotations} />
            </div>
          ) : (
            <>
              <span>Optional screenshot annotation may include visible page content.</span>
              <button className="secondary-button" onClick={() => setIsAnnotating(true)} type="button">
                <Crosshair size={14} />
                Annotate screen
              </button>
            </>
          )}
        </div>

        {annotations.length ? (
          <div className="annotation-note-list">
            {annotations.map((annotation) => (
              <label key={annotation.id}>
                <span>{annotation.index}</span>
                <input
                  onChange={(event) =>
                    setAnnotations((current) =>
                      current.map((item) => (item.id === annotation.id ? { ...item, note: event.target.value } : item)),
                    )
                  }
                  value={annotation.note ?? ""}
                />
              </label>
            ))}
          </div>
        ) : null}

        <footer className="modal-actions">
          <button type="button" className="secondary-button">
            Cancel
          </button>
          <button disabled={!canSubmit} onClick={submit} type="button" className="primary-button">
            <Send size={15} />
            Send feedback
          </button>
        </footer>
      </div>
    </section>
  );
}

function MiniScreenshot({ annotations }: { annotations: FeedbackAnnotationDraft[] }) {
  return (
    <div className="mini-screenshot" aria-label="Screenshot preview">
      <div className="mini-topbar">Project settings</div>
      <div className="mini-grid">
        <span />
        <span />
        <span />
      </div>
      <div className="mini-form" />
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
  );
}
