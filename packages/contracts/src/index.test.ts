import assert from "node:assert/strict";
import test from "node:test";
import {
  FEEDY_ANNOTATION_LABEL_MAX_LENGTH,
  FEEDY_SCREENSHOT_DATA_URL_MAX_LENGTH,
  createFeedbackRequestSchema,
  firstZodIssueMessage,
  formatZodIssuePath,
  formatZodIssues,
  sanitizeFeedbackAnnotationLabel,
} from "./index.js";

test("sanitizeFeedbackAnnotationLabel collapses whitespace and caps DOM-derived text", () => {
  const input = `  Save\n\n${"button ".repeat(80)}  `;
  const label = sanitizeFeedbackAnnotationLabel(input);

  assert.equal(label.includes("\n"), false);
  assert.equal(label.length, FEEDY_ANNOTATION_LABEL_MAX_LENGTH);
  assert.equal(label.startsWith("Save button"), true);
});

test("sanitizeFeedbackAnnotationLabel uses a safe fallback for empty labels", () => {
  assert.equal(sanitizeFeedbackAnnotationLabel("   "), "Selected element");
  assert.equal(sanitizeFeedbackAnnotationLabel(undefined, { fallback: "Fallback" }), "Fallback");
});

test("formatZodIssuePath formats nested issue paths", () => {
  assert.equal(formatZodIssuePath(["annotations", 0, "label"]), "annotations.0.label");
  assert.equal(formatZodIssuePath([]), "root");
});

test("formatZodIssues surfaces rejected screenshot field paths", () => {
  const result = createFeedbackRequestSchema.safeParse({
    appId: "test",
    description: "Screenshot payload should be rejected when it exceeds the budget.",
    environment: "test",
    page: { routePath: "/settings" },
    screenshot: {
      dataUrl: `data:image/jpeg;base64,${"a".repeat(FEEDY_SCREENSHOT_DATA_URL_MAX_LENGTH)}`,
      storageMode: "database",
    },
    type: "bug",
  });

  assert.equal(result.success, false);
  if (result.success) return;

  const issues = formatZodIssues(result.error);
  assert.equal(issues[0]?.path, "screenshot.dataUrl");
  assert.match(firstZodIssueMessage(result.error), /^screenshot\.dataUrl:/);
});

test("formatZodIssues surfaces rejected annotation label paths", () => {
  const result = createFeedbackRequestSchema.safeParse({
    annotations: [
      {
        id: "annotation-1",
        label: "x".repeat(FEEDY_ANNOTATION_LABEL_MAX_LENGTH + 1),
        x: 0.1,
        y: 0.2,
      },
    ],
    appId: "test",
    description: "Annotation labels should be sanitized before reaching the API.",
    environment: "test",
    page: { routePath: "/settings" },
    type: "bug",
  });

  assert.equal(result.success, false);
  if (result.success) return;

  const issues = formatZodIssues(result.error);
  assert.equal(issues[0]?.path, "annotations.0.label");
});
