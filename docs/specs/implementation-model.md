# Feedy Implementation Model

Feedy should be easy to adopt without requiring a hosted service.

The first public implementation is intentionally small: contracts, database schema, and example code before a polished app shell.

## Adoption Paths

### 1. Standalone Reference App

A runnable app that proves the feedback loop end to end:

- feedback widget
- intake API
- Postgres schema
- admin queue
- detail view
- notes and activity
- agent-readable context endpoint

The reference app should include UI from the start. Feedy is easier to understand when contributors can see and use the feedback widget, queue, detail view, and agent context flow.

### 2. Integration Recipes

Guides for adding Feedy capabilities to an existing product:

- add the widget
- submit feedback to an API route
- pass user and organization context
- run migrations
- protect admin routes with existing auth
- fetch agent-readable feedback context

### 3. Reusable Packages

Packages should be extracted as the reference app stabilizes:

- `@feedy/contracts`
- `@feedy/db`
- `@feedy/server`
- `@feedy/widget`
- optional `@feedy/admin`

The admin UI should not be extracted first. Start with a clear reference UI, prove the workflow, then decide which pieces should become reusable packages.

## UI Strategy

Feedy should provide UI as part of the open-source project.

Initial public UI should include:

- feedback widget
- screenshot annotation flow
- admin queue
- feedback detail
- notes and activity
- insights
- agent context view

Implementation order:

1. Build UI inside the standalone reference app.
2. Keep components simple and easy to copy.
3. Document the data contracts behind each surface.
4. Extract reusable packages only after the surfaces are stable.

This avoids over-abstracting too early while still giving adopters usable UI.

## First Milestone

The first useful open-source milestone is an implementable reference, not a finished product.

Deliverables:

- public README
- quickstart
- storage guide
- shared contracts
- Postgres migration
- basic intake example
- agent-context example

## Storage

Default production storage is Postgres.

Host apps can embed Feedy tables into their existing Postgres database. The initial schema uses a `feedy_` prefix so it can coexist with application tables.

Screenshot storage should support:

- `database` mode for simple demos and early implementation
- `object` mode for production volume with S3-compatible storage

## Next Build Sequence

1. Add a real Postgres store.
2. Add a small HTTP intake endpoint.
3. Add an agent-context endpoint.
4. Add a minimal admin queue.
5. Add a minimal detail view.
6. Add notes and activity.
7. Add insights and roadmap.
8. Extract reusable packages after boundaries are proven.
