# Next.js + shadcn-Style Integration Recipe

This recipe is for adding Feedy to an existing Next.js application that already has application shell, auth, and Postgres infrastructure.

The goal is an embedded feedback subsystem, not a separate service.

## Implementation Order

Implement in four chunks:

1. Database migration and store.
2. Admin authorization helper.
3. API route handlers.
4. Widget and admin UI.

Keep the first pass small. Text-only feedback is enough to prove the loop. Keep screenshot and annotation columns in the schema so capture can be added later without changing the core queue/detail model.

## 1. Database Migration And Store

Use the host app's existing Postgres service when one already exists.

Do not add a new Postgres container or service just for Feedy unless the host project truly needs database isolation.

Two checks matter:

- Infrastructure/schema: the app has Postgres and a migration flow.
- Runtime access: the app's server/API routes have a DB client they can use.

If Postgres exists but API routes do not have a runtime client, add one. For example:

```ts
// lib/feedy/db.ts
import pg from "pg";

export const feedyPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
```

Then implement a `PostgresFeedyStore` that matches the `FeedyStore` shape in `examples/api-adapter/src/index.ts`.

Minimum store methods:

- `createFeedback`
- `listFeedback`
- `getFeedbackDetail`
- `updateFeedback`
- `addNote`
- `getAgentContext`

Recommended migration strategy:

- Copy `packages/db/migrations/0001_feedback_core.sql` into the host app's migration flow.
- Keep the `feedy_` table prefix.
- Keep screenshot and annotation columns even if the first widget sends text only.
- Keep host user/org references as external IDs rather than adding hard foreign keys to host auth tables.

## 2. Admin Authorization Helper

Feedy should not own auth in embedded mode. Bring your own admin check.

Create a small helper that your Feedy admin routes can call:

```ts
// lib/feedy/auth.ts
export async function requireFeedyAdmin() {
  // Use the host app's existing auth system here.
  // Examples: Clerk metadata, NextAuth session role, internal user role table.
  const allowed = await isCurrentUserSuperAdmin();

  if (!allowed) {
    throw new Response("Forbidden", { status: 403 });
  }
}
```

Use this for:

- feedback queue
- feedback detail
- feedback updates
- notes
- agent-context endpoint

Public or product-user intake can be less restricted, depending on the product. Attach signed-in identity context when available.

## 3. API Routes

Map the framework-agnostic adapter to Next route handlers.

Suggested routes:

- `POST /api/feedy/feedback`
- `GET /api/feedy/feedback`
- `GET /api/feedy/feedback/[id]`
- `PATCH /api/feedy/feedback/[id]`
- `POST /api/feedy/feedback/[id]/notes`
- `GET /api/feedy/feedback/[id]/agent-context`

Example intake route:

```ts
// app/api/feedy/feedback/route.ts
import { NextResponse } from "next/server";
import { createFeedyHandlers } from "@/lib/feedy/handlers";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createFeedyHandlers().createFeedback(body);
  return NextResponse.json("data" in result ? result.data : { error: result.error }, { status: result.status });
}
```

Example admin route:

```ts
// app/api/feedy/admin/feedback/route.ts
import { NextResponse } from "next/server";
import { requireFeedyAdmin } from "@/lib/feedy/auth";
import { createFeedyHandlers } from "@/lib/feedy/handlers";

export async function GET(request: Request) {
  await requireFeedyAdmin();
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const result = await createFeedyHandlers().listFeedback(params);
  return NextResponse.json("data" in result ? result.data : { error: result.error }, { status: result.status });
}
```

## 4. Widget And Admin UI

Start with shadcn-light components:

- Use host `Button`, `Card`, and `Input` if they exist.
- Use plain `textarea`, `select`, and fixed-position panels if `Textarea`, `Select`, or `Dialog` wrappers do not exist yet.
- Style fallback controls with the host app's tokens and utility classes.
- Avoid adding a full component dependency just for the first pass.

Recommended first UI scope:

- Floating feedback button or simple nav item.
- Text-only feedback panel.
- Admin feedback queue.
- Admin feedback detail or inline row expansion.
- Agent-context JSON/payload view.

Defer:

- Screenshot capture.
- Element annotation.
- Roadmap board.
- Insights charts.
- Component-library expansion.

## Portable Component Contracts

Keep Feedy UI surfaces easy to lift by separating data contracts from styling.

### Feedback Widget

Inputs:

- `appId`
- `environment`
- `release`
- `routePath`
- optional `sourceUrl`
- optional user/org identity

Actions:

- `onSubmit(CreateFeedbackRequest)`

First-pass fields:

- `type`
- `description`
- optional `videoLink`

Later fields:

- `screenshot`
- `annotations`
- richer technical context

### Admin Queue

Inputs:

- `FeedbackListItem[]`
- current filters

Actions:

- `onSelect(id)`
- `onUpdate(id, UpdateFeedbackRequest)`
- `onFilter(filters)`

### Feedback Detail

Inputs:

- `FeedbackDetail`

Actions:

- `onUpdate(id, UpdateFeedbackRequest)`
- `onAddNote(CreateFeedbackNoteRequest)`
- `onOpenAgentContext(id)`

### Agent Context

Inputs:

- `AgentFeedbackContext`

Actions:

- copy payload
- open linked route/source
- link to issue, pull request, work order, or task when available

## First-Pass Done Criteria

A useful first embedded implementation is done when:

- The host migration creates Feedy tables.
- The host API routes can create, list, update, and read feedback.
- Public/product users can submit text feedback.
- Admin users can review and triage feedback.
- Coding agents can fetch or view structured agent context.
- Work is recorded in the host project's work log or equivalent project memory.

Screenshots and annotation are important, but they do not need to block the first stable loop.
