# Keep image storage private while serving the gallery publicly

The S3 bucket remains private with Block Public Access enabled; CloudFront serves published image assets through Origin Access Control. This preserves anonymous public viewing while preventing direct bucket reads, writes, or deletes and follows AWS's recommended S3 access boundary.

## Consequences

CloudFront and DNS become part of deployment, and cache invalidation must be considered when an image is deleted or replaced. The API remains the only component allowed to mutate image assets.
