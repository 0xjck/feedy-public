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
