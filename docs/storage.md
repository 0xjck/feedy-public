# Feedy Storage

Feedy's default production store is Postgres.

The first implementation path is designed for host applications that want to embed Feedy tables in their existing database. The schema uses a `feedy_` prefix so it can coexist with application tables.

## Required Environment

```text
DATABASE_URL=postgres://...
FEEDY_APP_ID=your-app
FEEDY_ENVIRONMENT=development|preview|production
FEEDY_RELEASE=2026.07.05
FEEDY_SCREENSHOT_STORAGE=database|object
FEEDY_PUBLIC_BASE_URL=https://your-app.example
```

## Optional Environment

```text
FEEDY_WRITE_KEY=...
FEEDY_OBJECT_STORAGE_BUCKET=...
FEEDY_OBJECT_STORAGE_REGION=...
FEEDY_OBJECT_STORAGE_ENDPOINT=...
FEEDY_OBJECT_STORAGE_ACCESS_KEY_ID=...
FEEDY_OBJECT_STORAGE_SECRET_ACCESS_KEY=...
FEEDY_RETENTION_DAYS=...
```

## Migration

The initial schema is:

```text
packages/db/migrations/0001_feedback_core.sql
```

It creates:

- `feedy_feedback_items`
- `feedy_feedback_notes`
- `feedy_feedback_activity`
- `feedy_feedback_links`

It also creates enum types for source, type, status, priority, complexity, and roadmap status.

## Screenshot Storage Modes

Use `FEEDY_SCREENSHOT_STORAGE=database` for early implementation and demos.

Database mode stores compressed screenshot data directly on the feedback row. This is simple and portable, but it is not ideal for high-volume production use.

Use `FEEDY_SCREENSHOT_STORAGE=object` for production volume.

Object mode stores an object key or URL on the feedback row and stores the image itself in S3-compatible object storage.

## Host Application Integration

For an existing product, start by embedding the Feedy tables in the product's Postgres database.

Recommended defaults:

- Use the host app's existing admin auth for Feedy admin routes.
- Pass host user and organization IDs as external IDs.
- Keep Feedy contracts independent from host-specific user/org tables.
- Start with database screenshot storage.
- Move screenshots to object storage before production volume grows.
