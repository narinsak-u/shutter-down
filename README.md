# Eyes Up, Shutter Down

A minimalist photography portfolio gallery built with Vue 3, powered by Contentful CMS.

## Tech Stack

- **Framework:** Vue 3 (Composition API, `<script setup lang="ts">`)
- **Language:** TypeScript ~6.0
- **Routing:** Vue Router 5
- **State:** Pinia (composition stores)
- **Styling:** Tailwind CSS v4 + PostCSS
- **CMS:** Contentful (Content Delivery API)
- **Build:** Vite 8
- **Testing:** Vitest 4 + jsdom + Vue Test Utils
- **Linting:** ESLint 10 + oxlint 1.60
- **Type-checking:** vue-tsc 3
- **Node:** ^20.19.0 \|\| >=22.12.0

## Project Structure

```
src/
  __tests__/        # Unit tests
  components/       # Vue components (Gallery, GalleryItem, Lightbox, Footer)
  router/           # Vue Router setup
  services/         # Contentful API integration
  stores/           # Pinia store (gallery)
  types/            # Shared TypeScript interfaces
  App.vue           # Root component
  main.ts           # App entry point
  style.css         # Global styles, Tailwind theme, design tokens
```

## Workflow

Content is managed in **Contentful** via the `gallery` content type with fields: `location`, `alt` (Rich Text), `date`, `type` (portrait/landscape/square), `category` (Architecture/Nature/Portrait), and `src` (Media asset). The app fetches data from Contentful's Delivery API in pages of 9, ordered by date descending, with infinite scroll for loading more.

### Environment Setup

```sh
cp .env.example .env
```

Set your Contentful credentials in `.env`:

```
VITE_CONTENTFUL_SPACE=your_contentful_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_contentful_cda_token
```

### Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run build-only` | Build without type-check |
| `npm run type-check` | Run `vue-tsc --build` |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run lint` | Run oxlint + ESLint |

## Features

- **Infinite scroll** — photos load in pages of 9 as you scroll
- **Category filtering** — filter by Architecture, Nature, Portrait
- **Lightbox** — fullscreen image viewer with keyboard navigation
- **Masonry layout** — CSS columns-based responsive grid
- **Scroll reveal** — items fade in as they enter the viewport
