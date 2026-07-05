import { z } from "zod";

export const FEEDY_ANNOTATION_LABEL_MAX_LENGTH = 120;
export const FEEDY_SCREENSHOT_DATA_URL_MAX_LENGTH = 5_500_000;

export const feedbackSourceSchema = z.enum(["platform", "website", "external"]);
export const feedbackTypeSchema = z.enum(["bug", "idea", "question", "request", "general"]);
export const feedbackStatusSchema = z.enum(["new", "backlog", "in_progress", "resolved", "dismissed"]);
export const feedbackPrioritySchema = z.enum(["P0", "P1", "P2"]);
export const feedbackComplexitySchema = z.enum(["S", "M", "L", "XL"]);
export const roadmapStatusSchema = z.enum(["now", "next", "future", "just_released"]);
export const feedbackActivityEventSchema = z.enum([
  "feedback_created",
  "feedback_updated",
  "note_added",
  "roadmap_promoted",
  "roadmap_status_changed",
  "agent_context_viewed",
]);

export const environmentSchema = z.enum(["development", "preview", "production"]).or(z.string().min(1).max(64));

export const pageContextSchema = z.object({
  routePath: z.string().min(1).max(2048),
  sourceUrl: z.string().url().max(4096).optional(),
  pageLabel: z.string().min(1).max(160).optional(),
  pageObjectType: z.string().min(1).max(80).optional(),
  pageObjectId: z.string().min(1).max(160).optional(),
});

export const identityContextSchema = z.object({
  externalUserId: z.string().min(1).max(160).optional(),
  userEmail: z.string().email().max(320).optional(),
  externalOrgId: z.string().min(1).max(160).optional(),
  orgLabel: z.string().min(1).max(240).optional(),
});

export const technicalInfoSchema = z.object({
  userAgent: z.string().max(1024).optional(),
  viewportWidth: z.number().int().positive().max(10000).optional(),
  viewportHeight: z.number().int().positive().max(10000).optional(),
  devicePixelRatio: z.number().positive().max(10).optional(),
  language: z.string().max(64).optional(),
  timezone: z.string().max(128).optional(),
  capturedAt: z.string().datetime().optional(),
});

export const feedbackAnnotationSchema = z.object({
  id: z.string().min(1).max(120),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1).optional(),
  height: z.number().min(0).max(1).optional(),
  label: z.string().min(1).max(FEEDY_ANNOTATION_LABEL_MAX_LENGTH).optional(),
  note: z.string().min(1).max(1000).optional(),
});

export const screenshotSchema = z.object({
  storageMode: z.enum(["database", "object"]).optional(),
  dataUrl: z.string().startsWith("data:image/").max(FEEDY_SCREENSHOT_DATA_URL_MAX_LENGTH).optional(),
  objectKey: z.string().min(1).max(1024).optional(),
  url: z.string().url().max(4096).optional(),
});

export const createFeedbackRequestSchema = z.object({
  source: feedbackSourceSchema.default("platform"),
  appId: z.string().min(1).max(120),
  environment: environmentSchema,
  release: z.string().min(1).max(120).optional(),
  type: feedbackTypeSchema,
  description: z.string().min(10).max(5000),
  videoLink: z.string().url().max(4096).optional(),
  page: pageContextSchema,
  identity: identityContextSchema.default({}),
  screenshot: screenshotSchema.optional(),
  annotations: z.array(feedbackAnnotationSchema).max(50).default([]),
  technicalInfo: technicalInfoSchema.default({}),
});

export const feedbackListFiltersSchema = z.object({
  query: z.string().max(240).optional(),
  status: feedbackStatusSchema.optional(),
  type: feedbackTypeSchema.optional(),
  priority: feedbackPrioritySchema.optional(),
  complexity: feedbackComplexitySchema.optional(),
  source: feedbackSourceSchema.optional(),
  environment: z.string().max(64).optional(),
  assigneeId: z.string().max(160).optional(),
  roadmapOnly: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const feedbackListItemSchema = z.object({
  id: z.string().uuid(),
  source: feedbackSourceSchema,
  appId: z.string(),
  environment: z.string(),
  release: z.string().optional(),
  routePath: z.string(),
  pageLabel: z.string().optional(),
  externalUserId: z.string().optional(),
  userEmail: z.string().optional(),
  externalOrgId: z.string().optional(),
  orgLabel: z.string().optional(),
  type: feedbackTypeSchema,
  status: feedbackStatusSchema,
  priority: feedbackPrioritySchema.optional(),
  complexity: feedbackComplexitySchema.optional(),
  assignedUserId: z.string().optional(),
  title: z.string().optional(),
  description: z.string(),
  hasScreenshot: z.boolean(),
  annotationCount: z.number().int().min(0),
  isRoadmapItem: z.boolean(),
  roadmapStatus: roadmapStatusSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  addressedAt: z.string().datetime().optional(),
});

export const feedbackNoteSchema = z.object({
  id: z.string().uuid(),
  feedbackId: z.string().uuid(),
  authorId: z.string().min(1).max(160).optional(),
  authorLabel: z.string().min(1).max(240).optional(),
  body: z.string().min(1).max(5000),
  createdAt: z.string().datetime(),
});

export const feedbackActivitySchema = z.object({
  id: z.string().uuid(),
  feedbackId: z.string().uuid(),
  event: feedbackActivityEventSchema,
  actorId: z.string().min(1).max(160).optional(),
  actorLabel: z.string().min(1).max(240).optional(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
});

export const feedbackDetailSchema = feedbackListItemSchema.extend({
  sourceUrl: z.string().url().optional(),
  pageObjectType: z.string().optional(),
  pageObjectId: z.string().optional(),
  videoLink: z.string().url().optional(),
  screenshot: screenshotSchema.optional(),
  annotations: z.array(feedbackAnnotationSchema),
  technicalInfo: technicalInfoSchema,
  featureFlagKey: z.string().optional(),
  featureFlagDescription: z.string().optional(),
  featureFlagCurrentBehavior: z.string().optional(),
  notes: z.array(feedbackNoteSchema),
  activity: z.array(feedbackActivitySchema),
});

export const updateFeedbackRequestSchema = z.object({
  type: feedbackTypeSchema.optional(),
  status: feedbackStatusSchema.optional(),
  priority: feedbackPrioritySchema.nullable().optional(),
  complexity: feedbackComplexitySchema.nullable().optional(),
  assignedUserId: z.string().min(1).max(160).nullable().optional(),
  title: z.string().min(1).max(240).nullable().optional(),
  isRoadmapItem: z.boolean().optional(),
  roadmapStatus: roadmapStatusSchema.nullable().optional(),
  featureFlagKey: z.string().min(1).max(160).nullable().optional(),
  featureFlagDescription: z.string().min(1).max(1000).nullable().optional(),
  featureFlagCurrentBehavior: z.string().min(1).max(1000).nullable().optional(),
});

export const createFeedbackNoteRequestSchema = z.object({
  feedbackId: z.string().uuid(),
  authorId: z.string().min(1).max(160).optional(),
  authorLabel: z.string().min(1).max(240).optional(),
  body: z.string().min(1).max(5000),
});

export const feedbackInsightsSchema = z.object({
  total: z.number().int().min(0),
  open: z.number().int().min(0),
  closed: z.number().int().min(0),
  untriaged: z.number().int().min(0),
  averageOpenAgeHours: z.number().min(0).optional(),
  byStatus: z.record(z.string(), z.number().int().min(0)).default({}),
  byType: z.record(z.string(), z.number().int().min(0)).default({}),
  byPriority: z.record(z.string(), z.number().int().min(0)).default({}),
  byComplexity: z.record(z.string(), z.number().int().min(0)).default({}),
  byRoadmapStatus: z.record(z.string(), z.number().int().min(0)).default({}),
});

export const agentFeedbackContextSchema = z.object({
  feedback: feedbackDetailSchema,
  summary: z.string().max(2000).optional(),
  reproductionContext: z.object({
    routePath: z.string(),
    sourceUrl: z.string().optional(),
    environment: z.string(),
    release: z.string().optional(),
    browser: z.string().optional(),
    viewport: z.string().optional(),
  }),
  implementationHints: z.object({
    priority: feedbackPrioritySchema.optional(),
    complexity: feedbackComplexitySchema.optional(),
    suggestedNextAction: z.string().max(1000).optional(),
    externalLinks: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
  }),
});

export type FeedbackSource = z.infer<typeof feedbackSourceSchema>;
export type FeedbackType = z.infer<typeof feedbackTypeSchema>;
export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>;
export type FeedbackPriority = z.infer<typeof feedbackPrioritySchema>;
export type FeedbackComplexity = z.infer<typeof feedbackComplexitySchema>;
export type RoadmapStatus = z.infer<typeof roadmapStatusSchema>;
export type CreateFeedbackRequest = z.infer<typeof createFeedbackRequestSchema>;
export type FeedbackListFilters = z.infer<typeof feedbackListFiltersSchema>;
export type FeedbackListItem = z.infer<typeof feedbackListItemSchema>;
export type FeedbackDetail = z.infer<typeof feedbackDetailSchema>;
export type UpdateFeedbackRequest = z.infer<typeof updateFeedbackRequestSchema>;
export type FeedbackNote = z.infer<typeof feedbackNoteSchema>;
export type FeedbackActivity = z.infer<typeof feedbackActivitySchema>;
export type CreateFeedbackNoteRequest = z.infer<typeof createFeedbackNoteRequestSchema>;
export type FeedbackInsights = z.infer<typeof feedbackInsightsSchema>;
export type AgentFeedbackContext = z.infer<typeof agentFeedbackContextSchema>;

export function sanitizeFeedbackAnnotationLabel(
  value: string | null | undefined,
  options: { fallback?: string; maxLength?: number } = {},
): string {
  const fallback = options.fallback ?? "Selected element";
  const maxLength = options.maxLength ?? FEEDY_ANNOTATION_LABEL_MAX_LENGTH;
  const sanitized = (value ?? "").trim().replace(/\s+/g, " ");
  return (sanitized || fallback).slice(0, maxLength);
}

export function formatZodIssuePath(path: Array<PropertyKey>): string {
  return path.length ? path.map((part) => String(part)).join(".") : "root";
}

export function formatZodIssues(error: z.ZodError): Array<{ message: string; path: string }> {
  return error.issues.map((issue) => ({
    message: issue.message,
    path: formatZodIssuePath(issue.path),
  }));
}

export function firstZodIssueMessage(error: z.ZodError): string {
  const [firstIssue] = formatZodIssues(error);
  if (!firstIssue) return "Invalid input";
  return `${firstIssue.path}: ${firstIssue.message}`;
}
