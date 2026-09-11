# Keep the frontend static and add a server API

The Vue frontend remains deployable as a static GitHub Pages site, while a separate server API owns authentication, SQLite, S3 credentials, and all privileged writes. This boundary is required because browser code cannot safely hold AWS credentials or directly provide durable SQLite storage, while retaining the existing low-cost public frontend delivery.

## Consequences

The project gains a second deployment and an API origin with CORS/HTTPS configuration, but the public gallery remains cacheable and the security-sensitive operations stay server-side.
