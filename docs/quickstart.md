# Feedy Quickstart

Feedy is currently at the contract-first skeleton stage.

The first useful path is to inspect the contracts, migration, and basic intake example.

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
- `docs/storage.md`: storage configuration guidance.

## Current Scope

This is not yet the full reference app. It is the first implementable foundation:

- typed feedback model
- database shape
- example storage interface
- example agent-readable context

The next slice should add a real Postgres store and a small HTTP intake endpoint.
