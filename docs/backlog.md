# Project Backlog

<!-- skill-state
output_sha256: e8c94c503fff54e9c698059debbd5652a72bb71fbbf7e8d036ddc8ac758c64bb
-->

## In Progress

<!-- Items with verified active work. -->

## Todo

<!-- Concrete, pick-up-worthy work not yet started. -->

## Blocked

<!-- Work that cannot proceed because an explicit blocker is recorded below. -->

## Needs Review

<!-- Evidence-backed candidates whose scope, priority, or next decision is unresolved. -->

### BL-001 — Verify image delivery and gallery cache plan

- **Status:** Needs Review
- **Priority:** Low
- **Context:** The image-performance plan still has unchecked implementation and final verification tasks. The recap records implementation commits for thumbnails and cache, but says successful tests were not run; reconcile the stale checklist against current code and verify remaining checks. No evidence establishes verification urgency.
- **Related:** `docs/superpowers/plans/2026-06-14-image-performance-plan.md`; `docs/superpowers/specs/2026-06-14-image-performance-design.md`
- **Tasks:**
  - [ ] Reconcile unchecked implementation steps with the committed implementation and retain only genuinely outstanding tasks.
  - [ ] Run the plan's unit tests, type check, lint, and build checks; update the plan with observed results.

### BL-002 — Verify Instagram-style lightbox plan and implementation

- **Status:** Needs Review
- **Priority:** Low
- **Context:** The plan's implementation checklist and final test, type-check, build, browser, and review steps remain unchecked. The recap records the feature as implemented but says test execution is unverified; remaining scope and verification need reconciliation. No evidence establishes verification urgency.
- **Related:** `docs/superpowers/plans/2026-08-29-instagram-lightbox.md`; `docs/superpowers/specs/2026-08-29-instagram-lightbox-design.md`
- **Tasks:**
  - [ ] Reconcile unchecked implementation steps with the committed implementation and identify the actual remaining work.
  - [ ] Run the plan's focused and full test, type-check, build, and quality checks; update the plan with observed results.
  - [ ] Inspect the lightbox at desktop and mobile widths using configured test data, as specified by the plan.

### BL-003 — Resolve the visitor-interaction security boundary

- **Status:** Needs Review
- **Priority:** Low
- **Context:** The interaction plan and `src/services/interactions.ts` use a browser-exposed Contentful Management token and client-side IP discovery. ADRs 0001, 0004, and 0006 specify a server/API boundary and no Management token in the public app; `docs/overview.md` explicitly says to confirm the intended production boundary before configuring credentials. Production exposure and urgency are not established by repository evidence.
- **Related:** `docs/overview.md`; `docs/adr/0001-static-frontend-with-server-api.md`; `docs/adr/0004-hash-visitor-ip-on-the-server.md`; `docs/adr/0006-contentful-as-transitional-write-store.md`; `docs/superpowers/plans/2026-08-29-instagram-lightbox.md`
- **Tasks:**
  - [ ] Decide whether the current browser-token implementation or the documented server boundary is intended for production.
  - [ ] Align the implementation and architecture documentation with that decision before configuring production credentials.

## Done

<!-- Completed items; preserve their completion records. -->
