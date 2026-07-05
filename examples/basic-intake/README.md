# Basic Intake Example

This example shows the smallest Feedy loop:

1. Validate a feedback submission with `@feedy/contracts`.
2. Store it in a simple in-memory store.
3. Fetch it as an agent-readable context payload.

The in-memory store is only for examples and tests. Production implementations should use the Postgres schema in `packages/db/migrations`.

## Example Concepts

- `FeedyStore`: minimal storage interface.
- `MemoryFeedyStore`: local example implementation.
- `runBasicIntakeExample`: creates one feedback item and returns the agent context.

The same contract shapes should be used by the future Postgres store, intake API, admin queue, and agent endpoint.
