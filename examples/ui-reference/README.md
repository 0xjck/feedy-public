# Feedy UI Reference

Copyable React UI for the first Feedy surfaces.

This example uses seeded data and the shared `@feedy/contracts` types. It does not require a database or backend.

## Run

```bash
npm install
npm run dev:ui
```

## Surfaces

- Feedback widget: `src/components/FeedbackWidget.tsx`
- Screenshot annotation: `src/components/ScreenshotAnnotator.tsx`
- Admin queue: `src/components/FeedbackQueue.tsx`
- Feedback detail: `src/components/FeedbackDetail.tsx`
- Insights: `src/components/FeedbackInsights.tsx`
- Agent context: `src/components/AgentContextPanel.tsx`
- Seed data: `src/data/seedFeedback.ts`

## Intent

This is reference UI, not a finished component library.

Start here when you want to understand how the Feedy contracts map to visible product surfaces. Extract reusable packages only after the reference app workflow is stable.

## Widget Variants

The reference widget is intentionally modal and evidence-oriented. That is the default Feedy interaction model because coding agents need more than a short text report.

Implementation variants:

- Compact panel: fastest first pass, text-only, useful for proving the DB/API/admin loop.
- Modal reference widget: default Feedy UX, with type selector, description, evidence language, and room for screenshot/annotation context.
- Full evidence widget: modal widget plus screenshot capture, annotation mode, numbered overlays, notes, preview, and re-annotate flow.

If you start with a compact panel, treat it as an implementation slice rather than the final Feedy model.

## Capture Behavior

The reference widget implements the core full-evidence behavior:

- modal hides while annotation mode is active
- annotation mode removes the modal scrim so the page remains inspectable
- hover preview uses the same target-resolution path as click selection
- target resolution prefers `data-feedback-target`, then controls, ARIA/component slots, and meaningful containers
- screenshot capture uses `modern-screenshot` first and `html2canvas` as a fallback
- feedback UI is excluded from captured screenshots
- screenshots are downscaled/compressed before submit
- annotation labels are sanitized with `sanitizeFeedbackAnnotationLabel`
