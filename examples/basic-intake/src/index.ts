import {
  type AgentFeedbackContext,
  type CreateFeedbackRequest,
  type FeedbackActivity,
  type FeedbackDetail,
  type FeedbackListItem,
  createFeedbackRequestSchema,
} from "@feedy/contracts";

export interface FeedyStore {
  createFeedback(input: CreateFeedbackRequest): Promise<FeedbackDetail>;
  listFeedback(): Promise<FeedbackListItem[]>;
  getFeedback(id: string): Promise<FeedbackDetail | null>;
  getAgentContext(id: string): Promise<AgentFeedbackContext | null>;
}

export class MemoryFeedyStore implements FeedyStore {
  private readonly feedback = new Map<string, FeedbackDetail>();

  async createFeedback(rawInput: CreateFeedbackRequest): Promise<FeedbackDetail> {
    const input = createFeedbackRequestSchema.parse(rawInput);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const activityId = crypto.randomUUID();

    const createdActivity: FeedbackActivity = {
      id: activityId,
      feedbackId: id,
      event: "feedback_created",
      metadata: {
        source: input.source,
        appId: input.appId,
        routePath: input.page.routePath,
      },
      createdAt: now,
    };

    const detail: FeedbackDetail = {
      id,
      source: input.source,
      appId: input.appId,
      environment: input.environment,
      release: input.release,
      routePath: input.page.routePath,
      sourceUrl: input.page.sourceUrl,
      pageLabel: input.page.pageLabel,
      pageObjectType: input.page.pageObjectType,
      pageObjectId: input.page.pageObjectId,
      externalUserId: input.identity.externalUserId,
      userEmail: input.identity.userEmail,
      externalOrgId: input.identity.externalOrgId,
      orgLabel: input.identity.orgLabel,
      type: input.type,
      status: "new",
      description: input.description,
      hasScreenshot: Boolean(input.screenshot?.dataUrl ?? input.screenshot?.objectKey ?? input.screenshot?.url),
      screenshot: input.screenshot,
      videoLink: input.videoLink,
      annotations: input.annotations,
      annotationCount: input.annotations.length,
      technicalInfo: input.technicalInfo,
      isRoadmapItem: false,
      notes: [],
      activity: [createdActivity],
      createdAt: now,
      updatedAt: now,
    };

    this.feedback.set(id, detail);
    return detail;
  }

  async listFeedback(): Promise<FeedbackListItem[]> {
    return [...this.feedback.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ notes: _notes, activity: _activity, screenshot: _screenshot, annotations: _annotations, technicalInfo: _technicalInfo, ...item }) => item);
  }

  async getFeedback(id: string): Promise<FeedbackDetail | null> {
    return this.feedback.get(id) ?? null;
  }

  async getAgentContext(id: string): Promise<AgentFeedbackContext | null> {
    const feedback = await this.getFeedback(id);
    if (!feedback) return null;

    const viewport =
      feedback.technicalInfo.viewportWidth && feedback.technicalInfo.viewportHeight
        ? `${feedback.technicalInfo.viewportWidth}x${feedback.technicalInfo.viewportHeight}`
        : undefined;

    return {
      feedback,
      summary: `${feedback.type} feedback on ${feedback.routePath}: ${feedback.description.slice(0, 240)}`,
      reproductionContext: {
        routePath: feedback.routePath,
        sourceUrl: feedback.sourceUrl,
        environment: feedback.environment,
        release: feedback.release,
        browser: feedback.technicalInfo.userAgent,
        viewport,
      },
      implementationHints: {
        priority: feedback.priority,
        complexity: feedback.complexity,
        suggestedNextAction: "Review the report, inspect the referenced route, and propose the smallest useful change.",
        externalLinks: [],
      },
    };
  }
}

export async function runBasicIntakeExample() {
  const store = new MemoryFeedyStore();

  const feedback = await store.createFeedback({
    source: "platform",
    appId: "demo-product",
    environment: "development",
    release: "local",
    type: "bug",
    description: "The save button stays disabled after I edit the project title.",
    page: {
      routePath: "/projects/demo/settings",
      sourceUrl: "https://example.test/projects/demo/settings",
      pageLabel: "Project settings",
      pageObjectType: "project",
      pageObjectId: "demo",
    },
    identity: {
      externalUserId: "user_demo",
      userEmail: "demo@example.test",
      externalOrgId: "org_demo",
      orgLabel: "Demo Org",
    },
    annotations: [
      {
        id: "annotation_1",
        x: 0.62,
        y: 0.74,
        width: 0.18,
        height: 0.08,
        note: "Button remains disabled here.",
      },
    ],
    technicalInfo: {
      userAgent: "Mozilla/5.0 Demo Browser",
      viewportWidth: 1440,
      viewportHeight: 960,
      timezone: "Europe/Oslo",
      capturedAt: new Date().toISOString(),
    },
  });

  const agentContext = await store.getAgentContext(feedback.id);
  return { feedback, agentContext };
}
