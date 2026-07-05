# Changelog

All notable public-facing changes to Feedy are tracked here.

Feedy is early-stage, so this changelog tracks implementation-shape changes rather than package releases.

## Unreleased

### Added

- Agent-first README framing and implementation questions.
- Contract-first TypeScript/Zod feedback model.
- Initial Postgres migration for feedback items, notes, activity, links, triage, roadmap state, screenshots, and annotations.
- Basic intake example with in-memory storage and agent-context output.
- Framework-agnostic API adapter example for intake, queue, detail, update, notes, and agent context.
- Copyable UI reference for widget, annotation, queue, detail, insights, and agent context.
- Next.js + shadcn-style integration recipe for embedded host-app implementations.
- Public export script for publishing a curated subset of the private working repository.

### Clarified

- Feedy should usually embed into the host app's existing Postgres database.
- Existing Postgres infrastructure is separate from having a runtime DB client available to app routes.
- First-pass integrations can skip screenshots while preserving schema space for screenshots and annotations.
- Feedy should use the host app's existing admin auth instead of owning authentication in embedded mode.
- Widget implementations can choose compact panel, modal reference widget, or full evidence widget, but compact text-only panels should be treated as first-pass slices rather than the full Feedy interaction model.
