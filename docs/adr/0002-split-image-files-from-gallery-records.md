# Store image files in S3 and gallery records in SQLite

Image assets are stored in S3, while photo metadata, the seeded Admin, likes, comments, and privacy-preserving Visitor Hashes are stored in SQLite. S3 is suited to durable object storage and public delivery; SQLite provides the constraints and relationships needed for gallery activity without retaining a second CMS.

## Consequences

The database and object store require coordinated upload cleanup and separate backups. The first version stores original image files only; responsive derivatives can be added later if measured delivery performance requires them.
