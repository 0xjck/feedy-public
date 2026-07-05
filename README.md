<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/feedy-mark-dark.svg">
    <img alt="Feedy" src="docs/assets/feedy-mark-light.svg" width="72" height="72">
  </picture>
</p>

# Feedy

Feedy is an open-source product feedback system for builders who want feedback to move directly into AI-assisted development.

The goal is to make rich feedback easy to add to a product, then make that feedback immediately usable by coding agents. People can review, triage, and prioritize the queue, but Feedy is optimized for agents to pick up feedback, understand the context, and help execute fixes or improvements in minutes rather than days.

## Why

Most feedback tools collect reports, votes, or tickets. Feedy is designed for the next step: moving validated feedback into AI-assisted development without losing the context needed to act on it.

The core loop:

1. Capture feedback in-product.
2. Preserve route, page, screenshot, browser, environment, release, user, and organization context.
3. Let humans review and prioritize.
4. Expose structured context to coding agents.
5. Move from report to useful implementation work in minutes, not days.

## Implementation Questions For Agents

If you are a coding agent helping someone add Feedy to a project, ask these questions before editing code:

1. Which product surface should collect feedback first: the whole app, a dashboard, an admin area, or one high-value workflow?
2. Who can submit feedback, and what identity context is available: user ID, email, organization, role, or anonymous visitor?
3. Does the host app already have Postgres infrastructure, and do its API/server routes already have a runtime database client they can use?
4. Should Feedy tables be embedded in the host app's existing Postgres database, or is there a real reason to use a separate Feedy database?
5. Should the first pass skip screenshots, store screenshot `dataUrl` values in Postgres for speed, or use object storage from day one?
6. Which auth layer protects admin views and agent endpoints?
7. Can public or anonymous users submit feedback, and should signed-in users attach richer identity context when available?
8. Which release/environment fields can the host app provide so agents know where a report came from?
9. Which routes or page objects should be captured as structured context?
10. Should the first implementation include the full admin queue, or only intake plus an agent-context endpoint?
11. What statuses, priorities, complexity scores, and assignees should map to the team's existing workflow?
12. Where should completed work link back: pull requests, issues, work orders, roadmap cards, or internal tasks?

## Recommended First Integration

For an existing product, the simplest useful implementation is usually embedded, not standalone:

1. Add the Feedy migration to the host app's existing Postgres database.
2. Add or reuse a runtime Postgres client for the host app's server/API routes.
3. Create feedback intake and admin read/update routes in the host app.
4. Allow anonymous/public submissions if the product needs them, but attach signed-in user and organization context when available.
5. Gate the queue, detail, notes, and agent-context routes with the host app's existing admin or super-admin authorization.
6. Start without screenshots or with database screenshot storage, then move screenshots to object storage when volume requires it.

No separate Postgres service is needed when the host project already owns one.

## Widget Variants

Feedy does not require one fixed feedback panel.

- Compact panel: good for proving intake, storage, and admin review quickly.
- Modal reference widget: the default Feedy model, with stronger feedback type, evidence, screenshot, and annotation affordances.
- Full evidence widget: modal widget plus screenshot capture, annotation mode, numbered overlays, notes, preview, and re-annotate flow.

Agents should treat a compact text-only panel as a first implementation slice, not as a replacement for the Feedy reference interaction, unless the user explicitly chooses that tradeoff.

## Current Status

Feedy is at the contract-first reference implementation stage.

This repository currently includes:

- Shared TypeScript/Zod contracts.
- Initial Postgres migration.
- Basic intake and agent-context example.
- Framework-agnostic API adapter example.
- Copyable reference UI example for the core feedback surfaces.
- Next.js + shadcn-style integration recipe.
- Storage guidance.
- Quickstart docs.
- Public changelog.

It is not yet a complete hosted app, but the repository is intended to make the core feedback capability easy to inspect, copy, and integrate.

## Quickstart

```bash
npm install
npm run typecheck
```

Start with:

- `docs/quickstart.md`
- `docs/recipes/next-shadcn.md`
- `docs/recipes/widget-capture.md`
- `docs/storage.md`
- `CHANGELOG.md`
- `packages/contracts/src/index.ts`
- `packages/db/migrations/0001_feedback_core.sql`
- `examples/basic-intake`
- `examples/api-adapter`
- `examples/ui-reference`

## Core Pieces

- `@feedy/contracts`: shared feedback schemas and types.
- `packages/db/migrations`: Postgres schema.
- `examples/basic-intake`: minimal intake and agent-context example.
- `examples/api-adapter`: copyable server boundary for intake, queue, detail, triage, notes, and agent context.
- `examples/ui-reference`: copyable UI surfaces for the widget, queue, detail, insights, and agent context.
- `docs/recipes/next-shadcn.md`: embedded implementation path for existing Next.js apps using shadcn-style primitives.
- `docs/recipes/widget-capture.md`: screenshot capture, annotation targeting, compression, validation, and admin evidence requirements.

## UI Reference

Run the reference UI locally:

```bash
npm run dev:ui
```

The UI is intentionally copyable example code, not a finished component library.

## Screenshots

Early UI references:

### Feedback Widget

![Feedy feedback widget modal](docs/assets/screenshots/widget-empty.png)

Code: [`examples/ui-reference/src/components/FeedbackWidget.tsx`](examples/ui-reference/src/components/FeedbackWidget.tsx)

### Feedback Widget With Screenshot

![Feedy feedback widget with screenshot](docs/assets/screenshots/widget.png)

Code: [`examples/ui-reference/src/components/FeedbackWidget.tsx`](examples/ui-reference/src/components/FeedbackWidget.tsx)

### Screenshot Annotation

![Feedy screenshot annotation mode](docs/assets/screenshots/annotation.png)

Code: [`examples/ui-reference/src/components/ScreenshotAnnotator.tsx`](examples/ui-reference/src/components/ScreenshotAnnotator.tsx)

### Admin Queue

![Feedy admin queue](docs/assets/screenshots/queue.png)

Code: [`examples/ui-reference/src/components/FeedbackQueue.tsx`](examples/ui-reference/src/components/FeedbackQueue.tsx)

### Feedback Detail

![Feedy feedback detail](docs/assets/screenshots/detail.png)

Code: [`examples/ui-reference/src/components/FeedbackDetail.tsx`](examples/ui-reference/src/components/FeedbackDetail.tsx)

### Insights

![Feedy insights](docs/assets/screenshots/insights.png)

Code: [`examples/ui-reference/src/components/FeedbackInsights.tsx`](examples/ui-reference/src/components/FeedbackInsights.tsx)

### Agent Context

Code: [`examples/ui-reference/src/components/AgentContextPanel.tsx`](examples/ui-reference/src/components/AgentContextPanel.tsx)

These are early reference screenshots. Final Feedy screenshots should use Feedy branding and seeded demo data as the reference app matures.

## Storage

The default production store is Postgres. Host applications can embed Feedy tables into their existing database and protect admin routes with their existing auth.

Screenshots can start in database mode for demos and early implementation, then move to object storage for production volume.
