# Contentful CMS Integration

**Date:** 2026-05-21
**Status:** Approved Design

## Overview

Replace hardcoded mock photo data in the Pinia gallery store with data fetched from Contentful's Content Delivery API. The gallery currently uses an array of 20 `Photo` objects defined directly in `src/stores/gallery.ts`. This spec describes a minimal, testable service layer that maps Contentful entries to the existing `Photo` interface.

## Content Model

Content Type ID: `gallery`

| Field | Type | Notes |
|-------|------|-------|
| `location` | Short text | e.g. "Stockholm, SE" |
| `alt` | Short text | Image alt text |
| `date` | Short text | e.g. "Sept 2023" |
| `type` | Short text (options) | Options: `portrait`, `landscape`, `square` |
| `category` | Short text (options) | Options: `Architecture`, `Nature`, `Portrait` |
| `image` | Media (Asset) | Linked image asset; URL resolved from `fields.file.url` |

## File Structure

```
src/
  services/
    contentful.ts       ← SDK client init + fetchPhotos()
  stores/
    gallery.ts          ← Remove mock data, add fetchPhotos action
  types/
    gallery.ts          ← Photo interface (extracted from store)
```

## Architecture

### Data Flow

```
onMounted (Gallery.vue)
  → galleryStore.fetchPhotos()
    → contentfulService.fetchPhotos()
      → client.getEntries({ content_type: 'gallery' })
        → map raw entries to Photo[]
    ← Photo[]
  → photos.value = result
  → filteredPhotos computed reacts
```

### Service Layer (`src/services/contentful.ts`)

- Creates a Contentful client via `contentful.createClient()` using `space` and `accessToken` from environment variables (`VITE_CONTENTFUL_SPACE`, `VITE_CONTENTFUL_ACCESS_TOKEN`).
- Exports `fetchPhotos(): Promise<Photo[]>`.
- Calls `client.getEntries({ content_type: 'gallery' })` with chain modifier `withoutUnresolvableLinks`.
- Maps each entry to `Photo`:
  - `id` → `entry.sys.id`
  - `src` → `https:${entry.fields.image?.fields?.file?.url}` (prepend protocol to relative URL)
  - `alt` → `entry.fields.alt`
  - `location` → `entry.fields.location`
  - `date` → `entry.fields.date`
  - `type` → validated against allowed values; fallback to `'square'` if invalid
  - `category` → `entry.fields.category`
- Errors are thrown as `Error('Failed to fetch photos')` for the store to catch.

### Store (`src/stores/gallery.ts`)

- `photos` ref starts as `[]` (removed hardcoded array).
- `loading` ref (`boolean`, default `false`).
- `error` ref (`string | null`, default `null`).
- `fetchPhotos()` async action:
  1. Sets `loading = true`, `error = null`.
  2. Calls `contentfulService.fetchPhotos()`.
  3. On success: `photos.value = result`.
  4. On failure: `error.value = error.message`.
  5. Always: `loading.value = false`.
- All other store logic (filter, lightbox) unchanged.

### Types (`src/types/gallery.ts`)

```typescript
export interface Photo {
  id: string;
  src: string;
  alt: string;
  location: string;
  date: string;
  type: 'portrait' | 'landscape' | 'square';
  category: string;
}
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_CONTENTFUL_SPACE` | Contentful Space ID |
| `VITE_CONTENTFUL_ACCESS_TOKEN` | Content Delivery API access token |

### Error & Loading States

- **Loading**: `loading` ref in store. Gallery component shows "Loading..." text while `loading` is true and no photos exist.
- **Empty**: Existing `v-if="filteredPhotos.length === 0"` handles empty state.
- **Error**: `error` ref in store. Gallery component conditionally shows error text and a "Retry" button below the filter nav that calls `fetchPhotos()`.

### Filter Categories

Hardcoded as before: `["all", "Architecture", "Nature", "Portrait"]` in Gallery.vue.

## Changes to Existing Files

### `src/stores/gallery.ts`
- Remove `Photo` interface (moved to types file).
- Remove hardcoded `photos` array.
- Add `loading` and `error` refs.
- Import and call `contentfulService.fetchPhotos()` in new `fetchPhotos()` action.
- Return `loading`, `error`, `fetchPhotos` from store.

### `src/components/Gallery.vue`
- Call `galleryStore.fetchPhotos()` in `onMounted`.
- Conditionally render loading text and error + retry button.

## Testing

- **Store test**: Mock the contentful service. Verify `fetchPhotos` sets photos on success and sets error on failure.
- **Gallery test**: Mock the store's `fetchPhotos` to resolve immediately. Verify gallery renders photos and empty/error states.
- Existing tests remain valid (they use Pinia with mocked store data).

## Non-Goals

- No caching layer (CDA responses are already cached by Contentful's CDN).
- No Preview API integration (starts with Delivery API only).
- No content model seeding (assumes user has created the `gallery` content type).
- No category list fetched from Contentful (hardcoded in frontend).
