# Project Overview

## Purpose

Eyes up, Shutter down is a public photography portfolio for browsing a personal collection by category and viewing individual photos. Visitors can also like and comment; the administrator publishes and manages photos through an embedded Contentful app. Evidence: `README.md`, `src/components/Lightbox.vue`, `src/components/ContentfulAdmin.vue`.

## Tech Stack

- **TypeScript / JavaScript**: Application code and tooling; Bun runs the package scripts (`package.json`).
- **Vue 3**: Single-page UI using Composition API components (`src/main.ts`, `src/components/`).
- **Vue Router**: Client-side navigation (`src/router/index.ts`).
- **Pinia**: Gallery state and pagination (`src/stores/gallery.ts`).
- **Contentful**: Published gallery content, visitor interactions, and authenticated admin writes (`src/services/`, `src/components/ContentfulAdmin.vue`).
- **Vite**: Development server and static production build (`vite.config.ts`, `package.json`).
- **Vitest**: Unit tests (`vitest.config.ts`, `src/__tests__/`).
- **Tailwind CSS v4**: Styling processed by PostCSS (`src/style.css`, `postcss.config.js`).

## Project Tree

```text
src/main.ts                     App startup; installs Pinia and router
src/App.vue                     Public shell or embedded Contentful admin shell
src/router/index.ts             Client routes: gallery and admin redirect
src/components/Gallery.vue      Photo grid, category filter, and pagination trigger
src/components/Lightbox.vue     Photo viewer and visitor interactions
src/components/ContentfulAdmin.vue Embedded photo publishing and management
src/stores/gallery.ts           Gallery state, cache, fetching, and pagination
src/services/                   Contentful reads/writes, cache, visitor identity
src/__tests__/                  Component, store, and service tests
.env.example                    Required Vite configuration names/placeholders
```

First read `src/main.ts` → `src/App.vue` and `src/router/index.ts` → the gallery/store/service files. The admin component is rendered only when embedded in Contentful; public `/admin` redirects to the configured external uploader URL when present, otherwise `/`.

## Workflow

**Complete — 3 verified workflows.** Traced the public entry, gallery/lightbox paths, and embedded admin component and its Contentful SDK operations.

| Workflow | Purpose |
|---|---|
| Browse the gallery | Fetch and filter published photos, load more pages, and open a photo in the lightbox. |
| Interact with a photo | Load interaction summary/comments; add or remove a like and submit a comment. |
| Publish or manage photos | In Contentful, publish a new photo or edit metadata/replace an image while retaining the photo entry. |

**Browse the gallery** — `src/components/Gallery.vue`, `src/stores/gallery.ts`, `src/services/contentful.ts`

```text
Gallery mounts
  ↓
Fetch first Contentful page (9 photos); update gallery/cache state
  ↓
Filter by category or open a photo
  ↓
When the scroll sentinel enters view, fetch and append the next page
```

**Interact with a photo** — `src/components/Lightbox.vue`, `src/services/anonymousIdentity.ts`, `src/services/interactions.ts`

```text
Open lightbox for a photo
  ↓
Resolve visitor identity and load likes plus visible comment page
  ↓
Create/delete a like or validate and submit a comment
  ↓
Write interaction to Contentful; refresh/update the displayed state
```

**Publish or manage photos** — `src/App.vue`, `src/components/ContentfulAdmin.vue`

```text
Open the app embedded in Contentful; initialize the Contentful SDK
  ↓
Upload mode: validate image type/size → create and publish asset
  ↓
Create and publish gallery entry; or manage mode: load published entries
  ↓
Save metadata/image replacement to the existing entry and publish it
```

## Scripts

Evidence: `package.json`, `AGENTS.md`. Commands listed here were **not exercised** during this catchup.

| Command | Purpose |
|---|---|
| `bun install` | Install dependencies; use `bun install --frozen-lockfile` to match CI. |
| `bun run dev` | Start the local Vite development server. |
| `bun run test:unit` | Run Vitest unit tests. |
| `bun run build` | Run type-check and production build. |
| `bun run preview` | Preview the built site locally. |

## Important Notes

- Copy variable **names**, not values, from `.env.example`: `VITE_CONTENTFUL_SPACE`, `VITE_CONTENTFUL_ACCESS_TOKEN`, `VITE_INTERACTION_SPACE`, `VITE_INTERACTION_ENVIRONMENT`, `VITE_INTERACTION_ACCESS_TOKEN`, `VITE_IP_DISCOVERY_URL`, and `VITE_UPLOADER_URL`. Contentful configuration is required for live data.
- Vite `VITE_*` values are client-side build configuration, not server secrets. `src/services/interactions.ts` uses `VITE_INTERACTION_ACCESS_TOKEN` in browser requests to Contentful Management API; treat that token as exposed to site visitors and do not place a privileged credential there. The browser-app implementation and the server-side boundary described by ADRs (`docs/adr/0001-static-frontend-with-server-api.md`, `docs/adr/0004-hash-visitor-ip-on-the-server.md`) differ; confirm the intended deployment/security boundary before configuring production writes.
- This repository is a static client, not the separate server API contemplated by the ADRs. It registers no server HTTP routes. Contentful Delivery/Management APIs and the external IP-discovery endpoint are called by the browser; their server behavior is outside this repository.
- `src/router/index.ts` defines client routes, not server endpoints. `/admin` is a redirect convenience, not authentication; management UI is mounted in the Contentful iframe and relies on Contentful installation/editor permissions (`docs/adr/0006-contentful-as-transitional-write-store.md`).
- GitHub Actions tests and builds on pushes/PRs targeting `main`; deploys only pushes to `main` (`.github/workflows/deploy.yml`).
<!-- skill-state
output_sha256: 8dbb3ab8b6500791beaa64aae4901ff9f71988db322559f32cc88ede48080398
-->