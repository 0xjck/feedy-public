# Feedy Quickstart

Feedy is currently at the contract-first reference implementation stage.

The first useful path is to inspect the contracts, migration, API adapter, and UI reference.

## Install

```bash
npm install
```

## Typecheck

```bash
npm run typecheck
```

## Key Files

- `packages/contracts/src/index.ts`: shared feedback contracts.
- `packages/db/migrations/0001_feedback_core.sql`: initial Postgres schema.
- `examples/basic-intake/src/index.ts`: minimal intake and agent-context example.
- `examples/api-adapter/src/index.ts`: framework-agnostic server boundary for real integrations.
- `examples/ui-reference/src`: copyable widget, annotation, queue, detail, insights, and agent context UI.
- `docs/storage.md`: storage configuration guidance.

## Current Scope

This is not yet a hosted app. It is the first implementable foundation:

- typed feedback model
- database shape
- example storage interface
- example agent-readable context
- copyable API handler surface
- copyable UI surfaces

The next slice should add a real Postgres implementation of the `FeedyStore` interface and framework-specific route examples.

## Existing App Checklist

For a first implementation inside an existing app:

1. Reuse the app's existing Postgres service when it has one.
2. Add the Feedy migration to the app's migration flow.
3. Add a runtime Postgres client for API/server routes if one does not already exist.
4. Wire `examples/api-adapter` concepts to the app's route layer.
5. Gate admin routes with the app's existing admin or super-admin auth.
6. Start without screenshots or with database screenshot storage; object storage can come later.
