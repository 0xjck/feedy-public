import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  FEEDY_SCREENSHOT_DATA_URL_MAX_LENGTH,
  sanitizeFeedbackAnnotationLabel,
  type FeedbackType,
} from "@feedy/contracts";
import { Bug, Check, Crosshair, HelpCircle, Image as ImageIcon, Lightbulb, Loader2, MessageCircle, MessageSquare, Send, X } from "lucide-react";
import { type FeedbackAnnotationDraft, typeOptions } from "../data/seedFeedback";
import { Badge } from "./Badge";

export type SubmittedFeedback = {
  annotations: FeedbackAnnotationDraft[];
  description: string;
  screenshotDataUrl?: string;
  type: FeedbackType;
  videoLink: string;
};

type ScreenshotState = "idle" | "capturing" | "captured" | "error";

type AnnotationTarget = Omit<FeedbackAnnotationDraft, "id" | "index" | "note">;

const SELECTABLE_TARGET_SELECTOR = [
  "[data-feedback-target]",
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "label",
  "[role='button']",
  "[role='link']",
  "[aria-label]",
  "[data-slot]",
  "article",
  "header",
  "nav",
  "aside",
  "section",
].join(",");

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
  const [preview, setPreview] = useState<AnnotationTarget>();
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>();
  const [screenshotState, setScreenshotState] = useState<ScreenshotState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [type, setType] = useState<FeedbackType>("bug");
  const [videoLink, setVideoLink] = useState("");
  const canSubmit = description.trim().length >= 10;
  const characterCount = useMemo(() => `${description.trim().length}/5000 characters`, [description]);

  async function startAnnotating() {
    setIsAnnotating(true);
    setPreview(undefined);
    window.setTimeout(() => {
      void captureScreenshot();
    }, 50);
  }

  async function captureScreenshot() {
    setScreenshotState("capturing");

    try {
      const { domToJpeg } = await import("modern-screenshot");
      const dataUrl = await domToJpeg(document.body, {
        backgroundColor: "#fafaf7",
        filter: (node) => !(node instanceof Element && node.hasAttribute("data-feedback-overlay")),
        height: window.innerHeight,
        scale: 1,
        style: { transform: "none" },
        width: window.innerWidth,
      });
      setScreenshotDataUrl(await compressScreenshotDataUrl(dataUrl));
      setScreenshotState("captured");
    } catch (modernScreenshotError) {
      try {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(document.body, {
          backgroundColor: "#fafaf7",
          ignoreElements: (element) => element.hasAttribute("data-feedback-overlay"),
          logging: false,
          scale: 1,
          useCORS: true,
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
          x: window.scrollX,
          y: window.scrollY,
        });
        setScreenshotDataUrl(await compressScreenshotDataUrl(canvas.toDataURL("image/jpeg", 0.72)));
        setScreenshotState("captured");
      } catch (html2canvasError) {
        console.error("Feedy screenshot capture failed", { html2canvasError, modernScreenshotError });
        setScreenshotDataUrl(undefined);
        setScreenshotState("error");
      }
    }
  }

  function targetElementFromPoint(event: ReactMouseEvent<HTMLButtonElement>) {
    const captureLayer = event.currentTarget;
    const overlayRoot = captureLayer.closest("[data-feedback-overlay]") as HTMLElement | null;
    const previousCapturePointerEvents = captureLayer.style.pointerEvents;
    const previousOverlayPointerEvents = overlayRoot?.style.pointerEvents;

    captureLayer.style.pointerEvents = "none";
    if (overlayRoot) overlayRoot.style.pointerEvents = "none";

    const element = document.elementFromPoint(event.clientX, event.clientY);

    captureLayer.style.pointerEvents = previousCapturePointerEvents;
    if (overlayRoot) overlayRoot.style.pointerEvents = previousOverlayPointerEvents ?? "";

    return resolveAnnotationTarget(element);
  }

  function previewAnnotation(event: ReactMouseEvent<HTMLButtonElement>) {
    const targetElement = targetElementFromPoint(event);
    setPreview(targetElement ? annotationForElement(targetElement) ?? fallbackAnnotation(event.clientX, event.clientY) : fallbackAnnotation(event.clientX, event.clientY));
  }

  function addAnnotation(event: ReactMouseEvent<HTMLButtonElement>) {
    const targetElement = targetElementFromPoint(event);
    const target = targetElement ? annotationForElement(targetElement) ?? fallbackAnnotation(event.clientX, event.clientY) : fallbackAnnotation(event.clientX, event.clientY);
    setAnnotations((current) => [
      ...current,
      {
        ...target,
        id: crypto.randomUUID(),
        index: current.length + 1,
        note: "",
      },
    ]);
    setPreview(undefined);
  }

  function submit() {
    if (!canSubmit) return;
    setSubmitError("");

    try {
      onSubmit({
        annotations: annotations.map((annotation, index) => {
          const note = annotation.note?.trim();
          return {
            ...annotation,
            ...(note ? { note } : {}),
            index: index + 1,
            label: sanitizeFeedbackAnnotationLabel(annotation.label),
          };
        }),
        description: description.trim(),
        ...(screenshotDataUrl ? { screenshotDataUrl } : {}),
        type,
        videoLink,
      });
      setAnnotations([]);
      setDescription("");
      setPreview(undefined);
      setScreenshotDataUrl(undefined);
      setScreenshotState("idle");
      setType("bug");
      setVideoLink("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit feedback.");
    }
  }

  return (
    <section className="surface demo-backdrop" aria-labelledby="widget-title">
      <div className={isAnnotating ? "demo-page annotating" : "demo-page"} aria-hidden={!isAnnotating}>
        <div className="demo-page-header">
          <strong>Project settings</strong>
          <Badge tone="green">Live</Badge>
        </div>
        <div className="metric-grid">
          <button className="metric-card selected" data-feedback-target="project-title-card" type="button">
            <span>Project title</span>
            <strong>Acme Studio</strong>
          </button>
          <button className="metric-card" data-feedback-target="open-reports-card" type="button">
            <span>Open reports</span>
            <strong>14</strong>
          </button>
          <article className="metric-card" data-feedback-target="agent-ready-card">
            <span>Agent-ready</span>
            <strong>9</strong>
          </article>
        </div>
        <div className="settings-form-preview" data-feedback-target="project-settings-form">
          <label>
            Project name
            <input defaultValue="Acme Studio" />
          </label>
          <button disabled type="button">
            Save changes
          </button>
        </div>
      </div>

      {isAnnotating ? (
        <div className="annotation-overlay-root" data-feedback-overlay>
          <button
            aria-label="Select feedback annotation target"
            className="annotation-capture-layer"
            onClick={addAnnotation}
            onMouseLeave={() => setPreview(undefined)}
            onMouseMove={previewAnnotation}
            type="button"
          />
          {preview ? <AnnotationBox annotation={{ ...preview, id: "preview", index: 0, note: "" }} preview /> : null}
          {annotations.map((annotation) => (
            <AnnotationBox annotation={annotation} key={annotation.id} />
          ))}
          <div className="floating-toolbar annotation-toolbar">
            <span>{annotations.length ? `${annotations.length} selected` : "Click visible page elements to annotate."}</span>
            <button className="secondary-button" onClick={() => setAnnotations([])} type="button">
              Clear
            </button>
            <button className="secondary-button" onClick={() => setIsAnnotating(false)} type="button">
              <X size={14} />
              Cancel
            </button>
            <button className="primary-button" onClick={() => setIsAnnotating(false)} type="button">
              <Check size={14} />
              Done
            </button>
          </div>
        </div>
      ) : null}

      <div className={isAnnotating ? "modal hidden-while-annotating" : "modal"} data-feedback-overlay>
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
                  {screenshotState === "capturing" ? <Loader2 className="spin" size={15} /> : <ImageIcon size={15} />}
                  Screenshot with {annotations.length} annotations
                </span>
                <button className="secondary-button compact" onClick={startAnnotating} type="button">
                  <Crosshair size={14} />
                  Re-annotate
                </button>
              </div>
              <MiniScreenshot annotations={annotations} {...(screenshotDataUrl ? { screenshotDataUrl } : {})} />
              <ScreenshotStatus state={screenshotState} />
            </div>
          ) : (
            <>
              <span>Optional screenshot annotation captures the visible page and selected component positions.</span>
              <button className="secondary-button" onClick={startAnnotating} type="button">
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
                  placeholder={annotation.label}
                  value={annotation.note ?? ""}
                />
              </label>
            ))}
          </div>
        ) : null}

        {submitError ? <p className="feedback-error">{submitError}</p> : null}

        <footer className="modal-actions">
          <button type="button" className="secondary-button">
            Cancel
          </button>
          <button disabled={!canSubmit || screenshotState === "capturing"} onClick={submit} type="button" className="primary-button">
            <Send size={15} />
            Send feedback
          </button>
        </footer>
      </div>
    </section>
  );
}

function MiniScreenshot({ annotations, screenshotDataUrl }: { annotations: FeedbackAnnotationDraft[]; screenshotDataUrl?: string }) {
  return (
    <div className="mini-screenshot" aria-label="Screenshot preview">
      {screenshotDataUrl ? (
        <img alt="Captured page screenshot" className="mini-screenshot-bitmap" src={screenshotDataUrl} />
      ) : (
        <>
          <div className="mini-topbar">Project settings</div>
          <div className="mini-grid">
            <span />
            <span />
            <span />
          </div>
          <div className="mini-form" />
        </>
      )}
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

function AnnotationBox({ annotation, preview = false }: { annotation: FeedbackAnnotationDraft; preview?: boolean }) {
  return (
    <div
      className={preview ? "screenshot-annotation annotation-preview-box" : "screenshot-annotation"}
      style={{
        height: `${annotation.height * 100}%`,
        left: `${annotation.x * 100}%`,
        top: `${annotation.y * 100}%`,
        width: `${annotation.width * 100}%`,
      }}
    >
      {preview ? null : <span>{annotation.index}</span>}
    </div>
  );
}

function ScreenshotStatus({ state }: { state: ScreenshotState }) {
  const label = {
    captured: "Screenshot captured and compressed.",
    capturing: "Capturing screenshot...",
    error: "Screenshot capture failed. Annotations can still be submitted.",
    idle: "Screenshot has not been captured yet.",
  }[state];

  return <p className="screenshot-status">{label}</p>;
}

function resolveAnnotationTarget(element: Element | null) {
  if (!element || element === document.body || element === document.documentElement) return null;
  return element.closest(SELECTABLE_TARGET_SELECTOR);
}

function annotationForElement(element: Element): AnnotationTarget | null {
  const rect = element.getBoundingClientRect();
  if (rect.width < 4 || rect.height < 4) return null;

  return {
    height: Math.max(0.02, Math.min(0.96, rect.height / window.innerHeight)),
    label: labelForElement(element),
    selector: selectorForElement(element),
    tagName: element.tagName.toLowerCase(),
    width: Math.max(0.02, Math.min(0.96, rect.width / window.innerWidth)),
    x: Math.max(0, Math.min(0.98, rect.left / window.innerWidth)),
    y: Math.max(0, Math.min(0.98, rect.top / window.innerHeight)),
  };
}

function fallbackAnnotation(clientX: number, clientY: number): AnnotationTarget {
  return {
    height: 0.12,
    label: "Selected area",
    selector: `point:${Math.round(clientX)}:${Math.round(clientY)}`,
    tagName: "area",
    width: 0.16,
    x: Math.max(0, Math.min(0.94, clientX / window.innerWidth - 0.03)),
    y: Math.max(0, Math.min(0.94, clientY / window.innerHeight - 0.03)),
  };
}

function labelForElement(element: Element) {
  const explicitLabel = element.getAttribute("data-feedback-target") ?? element.getAttribute("aria-label") ?? element.getAttribute("title");
  const text = element.textContent;
  return sanitizeFeedbackAnnotationLabel(explicitLabel ?? text ?? element.tagName.toLowerCase());
}

function selectorForElement(element: Element) {
  const explicit = element.getAttribute("data-feedback-target");
  if (explicit) return `[data-feedback-target="${explicit}"]`;
  if (element.id) return `#${CSS.escape(element.id)}`;
  return element.tagName.toLowerCase();
}

async function compressScreenshotDataUrl(dataUrl: string) {
  const image = await loadImage(dataUrl);
  const qualitySteps = [0.72, 0.6, 0.48, 0.36, 0.28, 0.2];
  let scale = Math.min(1, 1280 / image.width, 900 / image.height);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return dataUrl;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of qualitySteps) {
      const compressed = canvas.toDataURL("image/jpeg", quality);
      if (compressed.startsWith("data:image/") && compressed.length <= FEEDY_SCREENSHOT_DATA_URL_MAX_LENGTH) {
        return compressed;
      }
    }

    scale *= 0.72;
  }

  throw new Error("Captured screenshot is too large to attach after compression.");
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load captured screenshot for compression."));
    image.src = dataUrl;
  });
}
