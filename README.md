# Feedy

Feedy is open-source, agent-ready feedback infrastructure for software builders.

It helps products capture rich user feedback and turn it into structured context that humans can review and coding agents can use to investigate, prioritize, and execute changes quickly.

## Why

Most feedback tools collect reports, votes, or tickets. Feedy is designed for the next step: moving validated feedback into AI-assisted development without losing the context needed to act on it.

The core loop:

1. Capture feedback in-product.
2. Preserve route, page, screenshot, browser, environment, release, user, and organization context.
3. Let humans review and prioritize.
4. Expose structured context to coding agents.
5. Move from report to useful implementation work in minutes, not days.

## Current Status

Feedy is at the contract-first skeleton stage.

This repository currently includes:

- Shared TypeScript/Zod contracts.
- Initial Postgres migration.
- Basic intake and agent-context example.
- Storage guidance.
- Quickstart docs.

It is not yet a complete hosted app or polished admin UI.

## Quickstart

```bash
npm install
npm run typecheck
```

Start with:

- `docs/quickstart.md`
- `docs/storage.md`
- `packages/contracts/src/index.ts`
- `packages/db/migrations/0001_feedback_core.sql`
- `examples/basic-intake`

## Core Pieces

- `@feedy/contracts`: shared feedback schemas and types.
- `packages/db/migrations`: Postgres schema.
- `examples/basic-intake`: minimal intake and agent-context example.

## Storage

The default production store is Postgres. Host applications can embed Feedy tables into their existing database and protect admin routes with their existing auth.

Screenshots can start in database mode for demos and early implementation, then move to object storage for production volume.
