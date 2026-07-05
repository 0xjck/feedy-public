# API Adapter Example

This example shows the smallest useful server boundary for adding Feedy to an existing product.

It is framework-agnostic on purpose. A host app can call these handlers from Next.js Route Handlers, Express, Fastify, Hono, Rails-backed TypeScript clients, or any other HTTP layer.

## Operations

- `createFeedback`: validate widget submissions and store feedback.
- `listFeedback`: power the admin queue.
- `getFeedbackDetail`: power the detail view.
- `updateFeedback`: change status, priority, complexity, assignment, roadmap state, and title.
- `addFeedbackNote`: add internal triage notes.
- `getAgentContext`: return the structured payload a coding agent should use.

## Suggested Routes

Map these handlers to the host application's existing router:

- `POST /api/feedy/feedback` -> `createFeedback`
- `GET /api/feedy/feedback` -> `listFeedback`
- `GET /api/feedy/feedback/:id` -> `getFeedbackDetail`
- `PATCH /api/feedy/feedback/:id` -> `updateFeedback`
- `POST /api/feedy/feedback/:id/notes` -> `addFeedbackNote`
- `GET /api/feedy/feedback/:id/agent-context` -> `getAgentContext`

The included `MemoryFeedyStore` is for demos and tests. Production implementations should keep the same `FeedyStore` interface and back it with the Postgres schema in `packages/db/migrations`.

## Example

```ts
import { MemoryFeedyStore, createFeedyHandlers } from "@feedy/example-api-adapter";

const store = new MemoryFeedyStore({
  appId: "my-product",
  environment: "development",
});

export const feedy = createFeedyHandlers({ store });
```

Use your existing authentication around the admin and agent endpoints. The public widget endpoint should still attach the current route, release, environment, user, and organization context supplied by the host app.
