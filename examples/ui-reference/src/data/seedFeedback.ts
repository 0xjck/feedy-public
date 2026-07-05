import type {
  AgentFeedbackContext,
  FeedbackActivity,
  FeedbackComplexity,
  FeedbackDetail,
  FeedbackInsights,
  FeedbackListItem,
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
  RoadmapStatus,
} from "@feedy/contracts";

export type FeedbackAnnotationDraft = {
  id: string;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  note?: string;
  selector: string;
  tagName: string;
};

export type ExampleFeedbackDetail = Omit<FeedbackDetail, "annotations"> & {
  annotations: FeedbackAnnotationDraft[];
};

export const statusOptions: Array<{ label: string; value: FeedbackStatus }> = [
  { label: "New", value: "new" },
  { label: "Backlog", value: "backlog" },
  { label: "In progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Dismissed", value: "dismissed" },
];

export const typeOptions: Array<{ label: string; value: FeedbackType }> = [
  { label: "Bug", value: "bug" },
  { label: "Idea", value: "idea" },
  { label: "Question", value: "question" },
  { label: "Request", value: "request" },
  { label: "General", value: "general" },
];

export const priorityOptions: Array<{ label: string; value: FeedbackPriority | "none" }> = [
  { label: "Unprioritized", value: "none" },
  { label: "P0", value: "P0" },
  { label: "P1", value: "P1" },
  { label: "P2", value: "P2" },
];

export const complexityOptions: Array<{ label: string; value: FeedbackComplexity | "none" }> = [
  { label: "Unscored", value: "none" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
];

export const roadmapOptions: Array<{ label: string; value: RoadmapStatus | "none" }> = [
  { label: "Not on roadmap", value: "none" },
  { label: "Now", value: "now" },
  { label: "Next", value: "next" },
  { label: "Future", value: "future" },
  { label: "Just released", value: "just_released" },
];

const baseTechnicalInfo = {
  capturedAt: "2026-07-05T10:16:00.000Z",
  devicePixelRatio: 2,
  language: "en-GB",
  timezone: "Europe/Oslo",
  userAgent: "Mozilla/5.0 Example Browser",
  viewportHeight: 917,
  viewportWidth: 1564,
};

function activity(id: string, event: FeedbackActivity["event"], createdAt: string, actorLabel = "Product admin"): FeedbackActivity {
  return {
    actorLabel,
    createdAt,
    event,
    feedbackId: id,
    id: `${id.slice(0, 8)}-${event}-${createdAt.slice(0, 10)}`,
    metadata: {},
  };
}

export const seedFeedback: ExampleFeedbackDetail = {
  id: "2c8c9d29-3f4e-4b80-beb4-7b1f972ab001",
  source: "platform",
  appId: "demo-product",
  environment: "production",
  release: "2026.07.05",
  routePath: "/projects/acme/settings",
  sourceUrl: "https://example.test/projects/acme/settings",
  pageLabel: "Project settings",
  pageObjectType: "project",
  pageObjectId: "acme",
  externalUserId: "user_demo",
  userEmail: "demo.user@example.test",
  externalOrgId: "org_demo",
  orgLabel: "Acme Studio",
  type: "bug",
  status: "new",
  priority: "P1",
  complexity: "M",
  assignedUserId: "agent_triage",
  title: "Save button remains disabled",
  description: "The save button stays disabled after I edit the project title.",
  hasScreenshot: true,
  screenshot: {
    storageMode: "database",
  },
  videoLink: "https://example.test/share/demo",
  annotations: [
    {
      height: 0.18,
      id: "annotation_1",
      index: 1,
      label: "Save control",
      note: "Button remains disabled after editing the title.",
      selector: "button[data-save-project]",
      tagName: "button",
      width: 0.22,
      x: 0.54,
      y: 0.28,
    },
    {
      height: 0.18,
      id: "annotation_2",
      index: 2,
      label: "Validation summary",
      note: "There is no visible error explaining why saving is blocked.",
      selector: "section[data-validation-summary]",
      tagName: "section",
      width: 0.31,
      x: 0.08,
      y: 0.66,
    },
  ],
  annotationCount: 2,
  technicalInfo: baseTechnicalInfo,
  isRoadmapItem: false,
  notes: [
    {
      authorId: "admin_demo",
      authorLabel: "Product admin",
      body: "Looks reproducible. Ask the agent to inspect dirty-state and validation gating around the project title field.",
      createdAt: "2026-07-05T10:22:00.000Z",
      feedbackId: "2c8c9d29-3f4e-4b80-beb4-7b1f972ab001",
      id: "33b91121-85ad-4d46-83f4-4e052559c001",
    },
  ],
  activity: [
    {
      actorLabel: "Demo user",
      createdAt: "2026-07-05T10:16:00.000Z",
      event: "feedback_created",
      feedbackId: "2c8c9d29-3f4e-4b80-beb4-7b1f972ab001",
      id: "91cb4d1f-79e3-42f3-854a-c1000fb2f001",
      metadata: { routePath: "/projects/acme/settings" },
    },
    {
      actorLabel: "Product admin",
      createdAt: "2026-07-05T10:22:00.000Z",
      event: "note_added",
      feedbackId: "2c8c9d29-3f4e-4b80-beb4-7b1f972ab001",
      id: "91cb4d1f-79e3-42f3-854a-c1000fb2f002",
      metadata: {},
    },
  ],
  createdAt: "2026-07-05T10:16:00.000Z",
  updatedAt: "2026-07-05T10:22:00.000Z",
};

export const initialFeedback: ExampleFeedbackDetail[] = [
  seedFeedback,
  {
    ...seedFeedback,
    activity: [activity("74dcb67f-a880-433d-90f7-6b125497f002", "roadmap_promoted", "2026-07-04T16:15:00.000Z")],
    annotationCount: 0,
    annotations: [],
    assignedUserId: "agent_backlog",
    complexity: "L",
    createdAt: "2026-07-04T15:30:00.000Z",
    description: "Show failed webhook retries in the admin dashboard and link them back to the triggering event.",
    hasScreenshot: false,
    id: "74dcb67f-a880-433d-90f7-6b125497f002",
    isRoadmapItem: true,
    notes: [],
    pageLabel: "Webhooks",
    priority: "P2",
    roadmapStatus: "next",
    routePath: "/settings/webhooks",
    status: "backlog",
    title: "Expose webhook retry status",
    type: "request",
    updatedAt: "2026-07-04T16:15:00.000Z",
  },
  {
    ...seedFeedback,
    activity: [activity("e936ac51-95c4-4a91-8a4e-e5d8c34ef003", "feedback_updated", "2026-07-03T14:20:00.000Z")],
    annotationCount: 1,
    annotations: [
      {
        height: 0.12,
        id: "annotation_3",
        index: 1,
        label: "Duplicate rows",
        note: "Several items share the same page and description.",
        selector: "table[data-feedback-queue]",
        tagName: "table",
        width: 0.45,
        x: 0.36,
        y: 0.52,
      },
    ],
    assignedUserId: "agent_triage",
    complexity: "S",
    createdAt: "2026-07-03T12:20:00.000Z",
    description: "Let admins group similar feedback by product area and route before sending it to an agent.",
    id: "e936ac51-95c4-4a91-8a4e-e5d8c34ef003",
    isRoadmapItem: true,
    pageLabel: "Feedback queue",
    priority: "P1",
    roadmapStatus: "now",
    routePath: "/admin/feedback",
    status: "in_progress",
    title: "Group feedback by page",
    type: "idea",
    updatedAt: "2026-07-03T14:20:00.000Z",
  },
  {
    ...seedFeedback,
    activity: [activity("b58d4bdb-97d3-4c2a-b12c-0aa55b63f004", "feedback_updated", "2026-07-02T11:00:00.000Z")],
    addressedAt: "2026-07-02T11:00:00.000Z",
    annotationCount: 0,
    annotations: [],
    assignedUserId: "agent_storage",
    complexity: "S",
    createdAt: "2026-07-01T09:10:00.000Z",
    description: "Make screenshot storage mode visible in settings so teams know whether data is in Postgres or object storage.",
    hasScreenshot: false,
    id: "b58d4bdb-97d3-4c2a-b12c-0aa55b63f004",
    isRoadmapItem: false,
    notes: [],
    pageLabel: "Storage settings",
    priority: "P2",
    routePath: "/admin/settings/storage",
    status: "resolved",
    title: "Where do screenshots live?",
    type: "question",
    updatedAt: "2026-07-02T11:00:00.000Z",
  },
  {
    ...seedFeedback,
    activity: [activity("0d1ba88b-442f-45f6-8460-762b64288005", "feedback_created", "2026-06-29T08:00:00.000Z", "Demo user")],
    createdAt: "2026-06-29T08:00:00.000Z",
    description: "Add a concise way to tell the coding agent which feedback should be handled first.",
    hasScreenshot: true,
    id: "0d1ba88b-442f-45f6-8460-762b64288005",
    isRoadmapItem: true,
    pageLabel: "Agent context",
    priority: "P0",
    roadmapStatus: "future",
    routePath: "/admin/feedback/agent-context",
    status: "new",
    title: "Prioritise agent-ready work",
    type: "request",
    updatedAt: "2026-06-29T08:00:00.000Z",
  },
];

export function toListItem(item: ExampleFeedbackDetail): FeedbackListItem {
  const {
    activity: _activity,
    annotations: _annotations,
    featureFlagCurrentBehavior: _featureFlagCurrentBehavior,
    featureFlagDescription: _featureFlagDescription,
    featureFlagKey: _featureFlagKey,
    notes: _notes,
    pageObjectId: _pageObjectId,
    pageObjectType: _pageObjectType,
    screenshot: _screenshot,
    sourceUrl: _sourceUrl,
    technicalInfo: _technicalInfo,
    videoLink: _videoLink,
    ...listItem
  } = item;

  return listItem;
}

export function createInsights(items: FeedbackListItem[]): FeedbackInsights {
  const openStatuses = new Set<FeedbackStatus>(["new", "backlog", "in_progress"]);
  const closedStatuses = new Set<FeedbackStatus>(["resolved", "dismissed"]);
  const openItems = items.filter((item) => openStatuses.has(item.status));
  const untriaged = openItems.filter((item) => !item.priority || !item.complexity || !item.assignedUserId).length;
  const now = Date.parse("2026-07-05T12:00:00.000Z");
  const openAgeHours = openItems.reduce((total, item) => total + Math.max(0, now - Date.parse(item.createdAt)) / 36e5, 0);

  return {
    averageOpenAgeHours: openItems.length ? Math.round(openAgeHours / openItems.length) : 0,
    byComplexity: countBy(items, (item) => item.complexity ?? "none"),
    byPriority: countBy(items, (item) => item.priority ?? "none"),
    byRoadmapStatus: countBy(items.filter((item) => item.isRoadmapItem), (item) => item.roadmapStatus ?? "future"),
    byStatus: countBy(items, (item) => item.status),
    byType: countBy(items, (item) => item.type),
    closed: items.filter((item) => closedStatuses.has(item.status)).length,
    open: openItems.length,
    total: items.length,
    untriaged,
  };
}

export function createAgentContext(feedback: ExampleFeedbackDetail): AgentFeedbackContext {
  return {
    feedback,
    implementationHints: {
      complexity: feedback.complexity,
      externalLinks: [],
      priority: feedback.priority,
      suggestedNextAction: `Inspect ${feedback.routePath}, reproduce the submitted state, and resolve the highest-impact failing path before updating triage.`,
    },
    reproductionContext: {
      browser: feedback.technicalInfo.userAgent,
      environment: feedback.environment,
      release: feedback.release,
      routePath: feedback.routePath,
      sourceUrl: feedback.sourceUrl,
      viewport:
        feedback.technicalInfo.viewportWidth && feedback.technicalInfo.viewportHeight
          ? `${feedback.technicalInfo.viewportWidth}x${feedback.technicalInfo.viewportHeight}`
          : undefined,
    },
    summary: `${labelForType(feedback.type)} feedback on ${feedback.routePath}: ${feedback.title ?? feedback.description}`,
  };
}

export function labelForType(type: FeedbackType) {
  return typeOptions.find((option) => option.value === type)?.label ?? type;
}

export function labelForStatus(status: FeedbackStatus) {
  return statusOptions.find((option) => option.value === status)?.label ?? status;
}

export function labelForRoadmap(value: RoadmapStatus | undefined) {
  return roadmapOptions.find((option) => option.value === value)?.label ?? "Future";
}

function countBy<TItem>(items: TItem[], keyFor: (item: TItem) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((result, item) => {
    const key = keyFor(item);
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});
}
