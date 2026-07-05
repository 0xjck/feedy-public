import {
  type AgentFeedbackContext,
  type CreateFeedbackNoteRequest,
  type CreateFeedbackRequest,
  type FeedbackActivity,
  type FeedbackDetail,
  type FeedbackListFilters,
  type FeedbackListItem,
  type FeedbackNote,
  type UpdateFeedbackRequest,
  createFeedbackNoteRequestSchema,
  createFeedbackRequestSchema,
  feedbackListFiltersSchema,
  firstZodIssueMessage,
  formatZodIssues,
  updateFeedbackRequestSchema,
} from "@feedy/contracts";

export type ApiResult<TData> =
  | { data: TData; status: 200 | 201 }
  | { error: string; issues?: Array<{ message: string; path: string }>; status: 400 | 404 };

export type FeedyStoreConfig = {
  appId: string;
  environment: string;
  release?: string;
};

export interface FeedyStore {
  addNote(input: CreateFeedbackNoteRequest): Promise<FeedbackNote | null>;
  createFeedback(input: CreateFeedbackRequest): Promise<FeedbackDetail>;
  getAgentContext(id: string): Promise<AgentFeedbackContext | null>;
  getFeedbackDetail(id: string): Promise<FeedbackDetail | null>;
  listFeedback(filters?: FeedbackListFilters): Promise<FeedbackListItem[]>;
  updateFeedback(id: string, input: UpdateFeedbackRequest): Promise<FeedbackDetail | null>;
}

export class MemoryFeedyStore implements FeedyStore {
  private readonly feedback = new Map<string, FeedbackDetail>();
  private readonly config: FeedyStoreConfig;

  constructor(config: FeedyStoreConfig) {
    this.config = config;
  }

  async createFeedback(rawInput: CreateFeedbackRequest): Promise<FeedbackDetail> {
    const input = createFeedbackRequestSchema.parse(rawInput);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const createdActivity = createActivity(id, "feedback_created", now, {
      appId: input.appId,
      routePath: input.page.routePath,
      source: input.source,
    });
    const detail: FeedbackDetail = {
      activity: [createdActivity],
      annotationCount: input.annotations.length,
      annotations: input.annotations,
      appId: input.appId || this.config.appId,
      createdAt: now,
      description: input.description,
      environment: input.environment || this.config.environment,
      externalOrgId: input.identity.externalOrgId,
      externalUserId: input.identity.externalUserId,
      hasScreenshot: Boolean(input.screenshot?.dataUrl ?? input.screenshot?.objectKey ?? input.screenshot?.url),
      id,
      isRoadmapItem: false,
      notes: [],
      orgLabel: input.identity.orgLabel,
      pageLabel: input.page.pageLabel,
      pageObjectId: input.page.pageObjectId,
      pageObjectType: input.page.pageObjectType,
      release: input.release ?? this.config.release,
      routePath: input.page.routePath,
      screenshot: input.screenshot,
      source: input.source,
      sourceUrl: input.page.sourceUrl,
      status: "new",
      technicalInfo: input.technicalInfo,
      type: input.type,
      updatedAt: now,
      userEmail: input.identity.userEmail,
      videoLink: input.videoLink,
    };

    this.feedback.set(id, detail);
    return detail;
  }

  async listFeedback(rawFilters?: FeedbackListFilters): Promise<FeedbackListItem[]> {
    const filters = feedbackListFiltersSchema.parse(rawFilters ?? {});
    const query = filters.query?.trim().toLowerCase();
    const rows = [...this.feedback.values()]
      .filter((item) => {
        if (filters.status && item.status !== filters.status) return false;
        if (filters.type && item.type !== filters.type) return false;
        if (filters.priority && item.priority !== filters.priority) return false;
        if (filters.complexity && item.complexity !== filters.complexity) return false;
        if (filters.source && item.source !== filters.source) return false;
        if (filters.environment && item.environment !== filters.environment) return false;
        if (filters.assigneeId && item.assignedUserId !== filters.assigneeId) return false;
        if (filters.roadmapOnly && !item.isRoadmapItem) return false;
        if (!query) return true;
        return [item.description, item.title, item.pageLabel, item.routePath, item.userEmail, item.orgLabel]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(filters.offset, filters.offset + filters.limit);

    return rows.map(toListItem);
  }

  async getFeedbackDetail(id: string): Promise<FeedbackDetail | null> {
    return this.feedback.get(id) ?? null;
  }

  async updateFeedback(id: string, rawInput: UpdateFeedbackRequest): Promise<FeedbackDetail | null> {
    const current = this.feedback.get(id);
    if (!current) return null;
    const input = updateFeedbackRequestSchema.parse(rawInput);
    const now = new Date().toISOString();
    const next: FeedbackDetail = { ...current, updatedAt: now };

    if (input.type) next.type = input.type;
    if (input.status) next.status = input.status;
    if (input.isRoadmapItem !== undefined) next.isRoadmapItem = input.isRoadmapItem;
    if (input.assignedUserId !== undefined) next.assignedUserId = input.assignedUserId ?? undefined;
    if (input.complexity !== undefined) next.complexity = input.complexity ?? undefined;
    if (input.featureFlagCurrentBehavior !== undefined) {
      next.featureFlagCurrentBehavior = input.featureFlagCurrentBehavior ?? undefined;
    }
    if (input.featureFlagDescription !== undefined) next.featureFlagDescription = input.featureFlagDescription ?? undefined;
    if (input.featureFlagKey !== undefined) next.featureFlagKey = input.featureFlagKey ?? undefined;
    if (input.priority !== undefined) next.priority = input.priority ?? undefined;
    if (input.roadmapStatus !== undefined) next.roadmapStatus = input.roadmapStatus ?? undefined;
    if (input.title !== undefined) next.title = input.title ?? undefined;

    next.activity = [
      createActivity(id, input.isRoadmapItem ? "roadmap_promoted" : "feedback_updated", now, input),
      ...current.activity,
    ];
    this.feedback.set(id, next);
    return next;
  }

  async addNote(rawInput: CreateFeedbackNoteRequest): Promise<FeedbackNote | null> {
    const input = createFeedbackNoteRequestSchema.parse(rawInput);
    const current = this.feedback.get(input.feedbackId);
    if (!current) return null;
    const now = new Date().toISOString();
    const note: FeedbackNote = {
      authorId: input.authorId,
      authorLabel: input.authorLabel,
      body: input.body,
      createdAt: now,
      feedbackId: input.feedbackId,
      id: crypto.randomUUID(),
    };
    const next: FeedbackDetail = {
      ...current,
      activity: [createActivity(input.feedbackId, "note_added", now, { noteId: note.id }), ...current.activity],
      notes: [note, ...current.notes],
      updatedAt: now,
    };
    this.feedback.set(input.feedbackId, next);
    return note;
  }

  async getAgentContext(id: string): Promise<AgentFeedbackContext | null> {
    const feedback = await this.getFeedbackDetail(id);
    if (!feedback) return null;

    return {
      feedback,
      implementationHints: {
        complexity: feedback.complexity,
        externalLinks: [],
        priority: feedback.priority,
        suggestedNextAction: "Reproduce the report on the referenced route, inspect the annotated areas, and propose the smallest useful change.",
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
      summary: `${feedback.type} feedback on ${feedback.routePath}: ${feedback.title ?? feedback.description.slice(0, 180)}`,
    };
  }
}

export function createFeedyHandlers({ store }: { store: FeedyStore }) {
  return {
    async addFeedbackNote(input: unknown): Promise<ApiResult<FeedbackNote>> {
      const parsed = createFeedbackNoteRequestSchema.safeParse(input);
      if (!parsed.success) return validationError(parsed.error);
      const note = await store.addNote(parsed.data);
      if (!note) return { error: "Feedback not found.", status: 404 };
      return { data: note, status: 201 };
    },

    async createFeedback(input: unknown): Promise<ApiResult<FeedbackDetail>> {
      const parsed = createFeedbackRequestSchema.safeParse(input);
      if (!parsed.success) return validationError(parsed.error);
      return { data: await store.createFeedback(parsed.data), status: 201 };
    },

    async getAgentContext(id: string): Promise<ApiResult<AgentFeedbackContext>> {
      const context = await store.getAgentContext(id);
      if (!context) return { error: "Feedback not found.", status: 404 };
      return { data: context, status: 200 };
    },

    async getFeedbackDetail(id: string): Promise<ApiResult<FeedbackDetail>> {
      const feedback = await store.getFeedbackDetail(id);
      if (!feedback) return { error: "Feedback not found.", status: 404 };
      return { data: feedback, status: 200 };
    },

    async listFeedback(input?: unknown): Promise<ApiResult<FeedbackListItem[]>> {
      const parsed = feedbackListFiltersSchema.safeParse(input ?? {});
      if (!parsed.success) return validationError(parsed.error);
      return { data: await store.listFeedback(parsed.data), status: 200 };
    },

    async updateFeedback(id: string, input: unknown): Promise<ApiResult<FeedbackDetail>> {
      const parsed = updateFeedbackRequestSchema.safeParse(input);
      if (!parsed.success) return validationError(parsed.error);
      const feedback = await store.updateFeedback(id, parsed.data);
      if (!feedback) return { error: "Feedback not found.", status: 404 };
      return { data: feedback, status: 200 };
    },
  };
}

function validationError(error: Parameters<typeof formatZodIssues>[0]): ApiResult<never> {
  return {
    error: firstZodIssueMessage(error),
    issues: formatZodIssues(error),
    status: 400,
  };
}

function toListItem(item: FeedbackDetail): FeedbackListItem {
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

function createActivity(
  feedbackId: string,
  event: FeedbackActivity["event"],
  createdAt: string,
  metadata: Record<string, unknown>,
): FeedbackActivity {
  return {
    createdAt,
    event,
    feedbackId,
    id: crypto.randomUUID(),
    metadata,
  };
}
