# Hash visitor IPs only on the server

The API derives a Visitor Hash from the request IP and a server-only secret salt; raw IP addresses are not stored or sent to the browser. This keeps the existing anonymous like-deduplication behavior while removing the browser-side IP discovery dependency and reducing retained personal data.

## Consequences

Visitor Hashes cannot be reproduced if the server secret changes, so rotating that secret invalidates existing anonymous like ownership checks. The hash remains an abuse-control identifier, not a guaranteed person identity.
