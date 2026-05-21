# Eyes Up, Shutter Down

A minimalist photography portfolio gallery built with Vue 3, powered by Contentful CMS.

## Tech Stack

- **Framework:** Vue 3 (Composition API, `<script setup lang="ts">`)
- **Language:** TypeScript
- **State:** Pinia
- **Styling:** Tailwind CSS v4
- **CMS:** Contentful (Content Delivery API)
- **Build:** Vite
- **Testing:** Vitest + Vue Test Utils
- **Linting:** oxlint + ESLint

## Project Structure

```
src/
  components/       # Vue components (Gallery, Lightbox, etc.)
  services/         # External API integrations (Contentful)
  stores/           # Pinia stores
  types/            # Shared TypeScript interfaces
  __tests__/        # Unit tests
```

## Workflow

Content is managed in **Contentful** via the `gallery` content type with fields: `location`, `alt` (Rich Text), `date`, `type` (portrait/landscape/square), `category` (Architecture/Nature/Portrait), and `src` (Media asset). The app fetches data from Contentful's Delivery API in pages of 9, ordered by date descending, with infinite scroll for loading more.

### Environment Setup

```sh
cp .env.example .env
```

Set your Contentful credentials in `.env`:

```
VITE_CONTENTFUL_SPACE=your_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_cda_token
```

### Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run type-check` | Run vue-tsc type checking |
| `npm run test:unit` | Run unit tests |
| `npm run lint` | Run oxlint + ESLint |

## Features

- **Infinite scroll** — photos load in pages of 9 as you scroll
- **Category filtering** — filter by Architecture, Nature, Portrait
- **Lightbox** — fullscreen image viewer with keyboard navigation
- **Scroll reveal** — items fade in as they enter the viewport
