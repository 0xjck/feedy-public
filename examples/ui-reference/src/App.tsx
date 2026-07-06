import { useMemo, useState } from "react";
import type { FeedbackComplexity, FeedbackPriority, FeedbackStatus, FeedbackType, RoadmapStatus } from "@feedy/contracts";
import { AgentContextPanel } from "./components/AgentContextPanel";
import { FeedbackDetail } from "./components/FeedbackDetail";
import { FeedbackInsights } from "./components/FeedbackInsights";
import { FeedbackQueue } from "./components/FeedbackQueue";
import { FeedbackWidget, type SubmittedFeedback } from "./components/FeedbackWidget";
import { ScreenshotAnnotator } from "./components/ScreenshotAnnotator";
import {
  createAgentContext,
  createInsights,
  initialFeedback,
  seedFeedback,
  toListItem,
  type ExampleFeedbackDetail,
} from "./data/seedFeedback";

type FeedbackUpdate = Partial<{
  assignedUserId: string | undefined;
  complexity: FeedbackComplexity | undefined;
  isRoadmapItem: boolean;
  priority: FeedbackPriority | undefined;
  roadmapStatus: RoadmapStatus | undefined;
  status: FeedbackStatus;
  title: string | undefined;
  type: FeedbackType;
}>;

export function App() {
  const [feedback, setFeedback] = useState<ExampleFeedbackDetail[]>(initialFeedback);
  const [selectedId, setSelectedId] = useState(seedFeedback.id);
  const selectedFeedback = feedback.find((item) => item.id === selectedId) ?? feedback[0] ?? seedFeedback;
  const rows = useMemo(() => feedback.map(toListItem), [feedback]);
  const insights = useMemo(() => createInsights(rows), [rows]);
  const agentContext = useMemo(() => createAgentContext(selectedFeedback), [selectedFeedback]);

  function addSubmittedFeedback(submission: SubmittedFeedback) {
    const now = new Date("2026-07-05T12:30:00.000Z").toISOString();
    const id = `11111111-1111-4111-8111-${String(feedback.length + 1).padStart(12, "0")}`;
    const next: ExampleFeedbackDetail = {
      annotationCount: submission.annotations.length,
      annotations: submission.annotations,
      appId: "demo-product",
      createdAt: now,
      description: submission.description,
      environment: "production",
      hasScreenshot: Boolean(submission.screenshotDataUrl),
      id,
      isRoadmapItem: false,
      notes: [],
      routePath: "/projects/acme/settings",
      pageLabel: "Project settings",
      source: "platform",
      status: "new",
      screenshot: submission.screenshotDataUrl
        ? {
            dataUrl: submission.screenshotDataUrl,
            storageMode: "database",
          }
        : undefined,
      technicalInfo: {
        capturedAt: now,
        timezone: "Europe/Oslo",
        userAgent: "Mozilla/5.0 Example Browser",
        viewportHeight: 917,
        viewportWidth: 1564,
      },
      title: submission.description.split(".")[0]?.slice(0, 80) || "New feedback",
      type: submission.type,
      updatedAt: now,
      activity: [
        {
          actorLabel: "Demo user",
          createdAt: now,
          event: "feedback_created",
          feedbackId: id,
          id: `activity-${feedback.length + 1}`,
          metadata: { routePath: "/projects/acme/settings" },
        },
      ],
    };

    setFeedback((current) => [next, ...current]);
    setSelectedId(id);
  }

  function updateFeedback(id: string, update: FeedbackUpdate) {
    setFeedback((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...update,
              annotationCount: item.annotations.length,
              isRoadmapItem: update.roadmapStatus ? true : update.isRoadmapItem ?? item.isRoadmapItem,
              updatedAt: "2026-07-05T12:35:00.000Z",
            }
          : item,
      ),
    );
  }

  function addNote(id: string, body: string) {
    setFeedback((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              notes: [
                {
                  authorLabel: "Product admin",
                  body,
                  createdAt: "2026-07-05T12:40:00.000Z",
                  feedbackId: id,
                  id: `note-${item.notes.length + 1}-${id.slice(0, 8)}`,
                },
                ...item.notes,
              ],
              activity: [
                {
                  actorLabel: "Product admin",
                  createdAt: "2026-07-05T12:40:00.000Z",
                  event: "note_added",
                  feedbackId: id,
                  id: `activity-note-${item.notes.length + 1}-${id.slice(0, 8)}`,
                  metadata: {},
                },
                ...item.activity,
              ],
              updatedAt: "2026-07-05T12:40:00.000Z",
            }
          : item,
      ),
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p>Feedy UI reference</p>
        <h1>Agent-ready feedback surfaces.</h1>
        <span>Widget, screenshot annotation, admin triage, roadmap promotion, insights, and structured context from one contract.</span>
      </header>

      <FeedbackWidget onSubmit={addSubmittedFeedback} />
      <ScreenshotAnnotator />
      <FeedbackQueue onSelect={setSelectedId} onUpdate={updateFeedback} rows={rows} selectedId={selectedFeedback.id} />
      <FeedbackDetail feedback={selectedFeedback} onAddNote={addNote} onUpdate={updateFeedback} />
      <FeedbackInsights insights={insights} rows={rows} />
      <AgentContextPanel context={agentContext} />
    </main>
  );
}
