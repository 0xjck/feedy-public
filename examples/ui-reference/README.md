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
