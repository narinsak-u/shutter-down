# Use a Contentful App Framework page as the write boundary

Contentful remains the immediate source of published photos while the S3/SQLite migration is deferred. A Contentful App Framework Page app owns the upload UI and uses Contentful's authenticated CMA adapter to create and publish assets and gallery entries. The public gallery remains a static GitHub Pages app, and no Management token is bundled into it.

## Consequences

The admin UI runs inside Contentful rather than at a public `/admin` route. Contentful installation and editor permissions protect writes; the future storage migration will replace the app's write implementation when needed.
