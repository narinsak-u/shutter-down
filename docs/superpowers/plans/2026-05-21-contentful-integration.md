# Contentful CMS Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded mock photo data in the gallery with data fetched from Contentful CMS.

**Architecture:** A service layer wraps the Contentful JS SDK to fetch and map `gallery` entries to the existing `Photo` interface. The Pinia store calls the service on mount, managing loading/error states. Components display the data reactively.

**Tech Stack:** Vue 3, Pinia, TypeScript, contentful (npm package), Vitest

---

### Task 0: Prepare environment and install dependencies

**Files:**
- Create: `.env.example`
- Modify: `package.json` (add dependency)

- [ ] **Step 1: Add contentful dependency**

```bash
npm install contentful
```

Expected: `contentful` added to `dependencies` in `package.json`.

- [ ] **Step 2: Create .env.example**

Create `.env.example`:

```
# Contentful CMS
VITE_CONTENTFUL_SPACE=your_contentful_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_contentful_cda_token
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add contentful dependency and env template"
```

---

### Task 1: Extract `Photo` interface into dedicated types file

**Files:**
- Create: `src/types/gallery.ts`
- Modify: `src/stores/gallery.ts` (remove interface, add import)

- [ ] **Step 1: Create types file**

`src/types/gallery.ts`:

```typescript
export interface Photo {
  id: string;
  src: string;
  alt: string;
  location: string;
  date: string;
  type: "portrait" | "landscape" | "square";
  category: string;
}
```

- [ ] **Step 2: Remove interface from store and add import**

In `src/stores/gallery.ts`, delete the `Photo` interface (lines 4-12). Add import at the top:

```typescript
import type { Photo } from "@/types/gallery";
```

- [ ] **Step 3: Run type-check to verify**

```bash
npm run type-check
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/gallery.ts src/stores/gallery.ts
git commit -m "refactor: extract Photo interface to dedicated types file"
```

---

### Task 2: Create Contentful service

**Files:**
- Create: `src/services/contentful.ts`

- [ ] **Step 1: Create contentful service**

`src/services/contentful.ts`:

```typescript
import * as contentful from "contentful";
import type { Photo } from "@/types/gallery";

const client = contentful.createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE as string,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN as string,
});

const VALID_TYPES = new Set(["portrait", "landscape", "square"]);

function validateType(value: string): Photo["type"] {
  if (VALID_TYPES.has(value)) return value as Photo["type"];
  return "square";
}

export async function fetchPhotos(): Promise<Photo[]> {
  const response = await client.withoutUnresolvableLinks.getEntries({
    content_type: "gallery",
  });

  return response.items.map((entry) => {
    const fields = entry.fields as Record<string, unknown>;
    const image = fields.image as
      | { fields?: { file?: { url?: string } } }
      | undefined;
    const imageUrl = image?.fields?.file?.url ?? "";
    return {
      id: entry.sys.id,
      src: imageUrl ? `https:${imageUrl}` : "",
      alt: fields.alt as string,
      location: fields.location as string,
      date: fields.date as string,
      type: validateType(fields.type as string),
      category: fields.category as string,
    };
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/contentful.ts
git commit -m "feat: add Contentful service layer for fetching gallery photos"
```

---

### Task 3: Update gallery store with async fetch logic

**Files:**
- Modify: `src/stores/gallery.ts`

- [ ] **Step 1: Rewrite the store**

Replace the entire store in `src/stores/gallery.ts`:

```typescript
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Photo } from "@/types/gallery";
import { fetchPhotos } from "@/services/contentful";

export const useGalleryStore = defineStore("gallery", () => {
  const photos = ref<Photo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const activeFilter = ref("all");
  const lightboxOpen = ref(false);
  const lightboxIndex = ref<number>(0);

  const filteredPhotos = computed(() => {
    if (activeFilter.value === "all") return photos.value;
    return photos.value.filter((p) => p.category === activeFilter.value);
  });

  function setFilter(filter: string) {
    activeFilter.value = filter;
  }

  async function fetchAllPhotos() {
    loading.value = true;
    error.value = null;
    try {
      photos.value = await fetchPhotos();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load photos";
    } finally {
      loading.value = false;
    }
  }

  return {
    photos,
    loading,
    error,
    activeFilter,
    lightboxOpen,
    lightboxIndex,
    filteredPhotos,
    setFilter,
    fetchAllPhotos,
  };
});
```

- [ ] **Step 2: Run type-check to verify**

```bash
npm run type-check
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/stores/gallery.ts
git commit -m "feat: add async fetchAllPhotos action to gallery store"
```

---

### Task 4: Update Gallery component with loading/error states

**Files:**
- Modify: `src/components/Gallery.vue`

- [ ] **Step 1: Add fetch call on mount + loading/error template**

In `src/components/Gallery.vue`:

In the `<script>` section, add `fetchAllPhotos` to the destructured store and call it in `onMounted`:

```typescript
const galleryStore = useGalleryStore();
const { fetchAllPhotos } = galleryStore;

onMounted(() => {
  fetchAllPhotos();
  setupScrollReveal();
});
```

Also destructure `loading` and `error` from the store for template use. Actually, since we already have `galleryStore`, we can access them via `galleryStore.loading` etc. in the template.

In the `<template>` section, add loading and error UI after the filter nav (before the `TransitionGroup`):

```html
<p v-if="galleryStore.loading" class="text-center py-20 text-body-lg font-body-lg text-secondary">
  Loading...
</p>

<div
  v-else-if="galleryStore.error"
  class="text-center py-20"
>
  <p class="text-body-lg font-body-lg text-red-500 mb-4">{{ galleryStore.error }}</p>
  <button
    class="text-label-sm font-label-sm text-primary underline cursor-pointer"
    @click="galleryStore.fetchAllPhotos()"
  >
    Retry
  </button>
</div>
```

Also wrap the `TransitionGroup` and empty state in a conditional so they only render when not loading and no error:

```html
<template v-if="!galleryStore.loading && !galleryStore.error">
  <TransitionGroup ...>
    ...
  </TransitionGroup>

  <div v-if="galleryStore.filteredPhotos.length === 0" class="text-center py-20">
    <p class="text-body-lg font-body-lg text-secondary">No images in this category yet.</p>
  </div>
</template>
```

Full template after changes should look like:

```html
<template>
  <main
    class="pt-20 pb-section-gap px-container-margin-mobile md:px-container-margin-desktop md:mx-10 min-h-screen"
  >
    <section class="mb-16 md:mb-20 max-w-2xl">
      <h2 class="text-headline-xl font-headline-xl text-primary mb-6">Eyes up, shutter down.</h2>
      <p class="text-body-lg font-body-lg text-secondary max-w-xl">
        Walk around, frame the shot, and immediately move on to the next thing without overthinking
        it.
      </p>
    </section>

    <nav class="flex items-center gap-8 mb-12 overflow-x-auto no-scrollbar">
      <button
        v-for="category in categories"
        :key="category"
        @click="galleryStore.setFilter(category)"
        :class="[
          'text-label-sm cursor-pointer font-label-sm whitespace-nowrap transition-all duration-200 ease-out pb-1',
          galleryStore.activeFilter === category
            ? 'text-primary border-b-2 border-primary'
            : 'text-secondary hover:text-primary',
        ]"
      >
        {{ category === "all" ? "All Work" : category }}
      </button>
    </nav>

    <p v-if="galleryStore.loading" class="text-center py-20 text-body-lg font-body-lg text-secondary">
      Loading...
    </p>

    <div
      v-else-if="galleryStore.error"
      class="text-center py-20"
    >
      <p class="text-body-lg font-body-lg text-red-500 mb-4">{{ galleryStore.error }}</p>
      <button
        class="text-label-sm font-label-sm text-primary underline cursor-pointer"
        @click="galleryStore.fetchAllPhotos()"
      >
        Retry
      </button>
    </div>

    <template v-if="!galleryStore.loading && !galleryStore.error">
      <TransitionGroup
        name="gallery"
        tag="div"
        class="masonry-grid"
        id="gallery"
        @enter="(el: Element) => el.classList.remove('opacity-0', 'translate-y-8')"
      >
        <GalleryItem
          v-for="(item, index) in galleryStore.filteredPhotos"
          :key="item.id"
          :src="item.src"
          :alt="item.alt"
          :location="item.location"
          :date="item.date"
          :type="item.type"
          @click="openPhoto(index)"
        />
      </TransitionGroup>

      <div v-if="galleryStore.filteredPhotos.length === 0" class="text-center py-20">
        <p class="text-body-lg font-body-lg text-secondary">No images in this category yet.</p>
      </div>
    </template>
  </main>

  <Lightbox
    v-model="galleryStore.lightboxOpen"
    :items="galleryStore.filteredPhotos"
    v-model:index="galleryStore.lightboxIndex"
  />
</template>
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Gallery.vue
git commit -m "feat: add loading/error states and fetch photos on mount in Gallery"
```

---

### Task 5: Write store tests

**Files:**
- Create: `src/__tests__/gallery-store.spec.ts`

- [ ] **Step 1: Write store tests**

`src/__tests__/gallery-store.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useGalleryStore } from "@/stores/gallery";

vi.mock("@/services/contentful", () => ({
  fetchPhotos: vi.fn(),
}));

const { fetchPhotos } = await import("@/services/contentful");

const mockPhotos = [
  {
    id: "1",
    src: "https://images.ctfassets.net/abc/image.jpg",
    alt: "Test photo",
    location: "Test, Location",
    date: "Jan 2024",
    type: "landscape" as const,
    category: "Nature",
  },
];

describe("galleryStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("starts with empty photos, not loading, no error", () => {
    const store = useGalleryStore();
    expect(store.photos).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it("sets photos on successful fetch", async () => {
    vi.mocked(fetchPhotos).mockResolvedValue(mockPhotos);
    const store = useGalleryStore();
    await store.fetchAllPhotos();
    expect(store.photos).toEqual(mockPhotos);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it("sets error on failed fetch", async () => {
    vi.mocked(fetchPhotos).mockRejectedValue(new Error("Network error"));
    const store = useGalleryStore();
    await store.fetchAllPhotos();
    expect(store.photos).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBe("Network error");
  });

  it("sets loading during fetch", async () => {
    let resolvePromise!: (photos: typeof mockPhotos) => void;
    vi.mocked(fetchPhotos).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );
    const store = useGalleryStore();
    const promise = store.fetchAllPhotos();
    expect(store.loading).toBe(true);
    resolvePromise(mockPhotos);
    await promise;
    expect(store.loading).toBe(false);
  });
});
```

- [ ] **Step 2: Run test**

```bash
npx vitest run src/__tests__/gallery-store.spec.ts
```

Expected: All 4 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/gallery-store.spec.ts
git commit -m "test: add gallery store tests for fetch/loading/error states"
```

---

### Task 6: Update App test

**Files:**
- Modify: `src/__tests__/App.spec.ts`

The App test mocks `IntersectionObserver` and mounts the App. Since the gallery store now calls `fetchPhotos()` on mount, we need to mock the contentful service to prevent an actual API call.

- [ ] **Step 1: Add contentful service mock to App test**

In `src/__tests__/App.spec.ts`, add after the `vi.stubGlobal('IntersectionObserver', ...)` line:

```typescript
vi.mock("@/services/contentful", () => ({
  fetchPhotos: vi.fn().mockResolvedValue([]),
}));
```

Full file after change:

```typescript
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import App from "../App.vue";

const IntersectionObserverMock = vi.fn<
  (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) => Record<string, unknown>
>(function () {
  return {
    root: null,
    rootMargin: "0px",
    thresholds: [0],
    disconnect: vi.fn<() => void>(),
    observe: vi.fn<() => void>(),
    takeRecords: vi.fn<() => void>(),
    unobserve: vi.fn<() => void>(),
  };
});

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

vi.mock("@/services/contentful", () => ({
  fetchPhotos: vi.fn().mockResolvedValue([]),
}));

describe("App", () => {
  it("renders the gallery headline", () => {
    setActivePinia(createPinia());
    const wrapper = mount(App);
    expect(wrapper.text()).toContain("Eyes up, shutter down.");
    expect(wrapper.text()).toContain("Built with");
  });
});
```

- [ ] **Step 2: Run test**

```bash
npx vitest run src/__tests__/App.spec.ts
```

Expected: Test passes.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/App.spec.ts
git commit -m "test: mock contentful service in App.spec.ts"
```

---

### Task 7: Write service tests

**Files:**
- Create: `src/__tests__/contentful-service.spec.ts`

- [ ] **Step 1: Write service tests**

`src/__tests__/contentful-service.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("contentful", () => ({
  createClient: vi.fn(),
}));

const { createClient } = await import("contentful");
const { fetchPhotos } = await import("@/services/contentful");

const mockEntry = (overrides: Record<string, unknown> = {}) => ({
  sys: { id: "entry-1" },
  fields: {
    location: "Paris, FR",
    alt: "A beautiful photo",
    date: "Jan 2024",
    type: "portrait",
    category: "Architecture",
    image: {
      fields: {
        file: { url: "//images.ctfassets.net/abc/photo.jpg" },
      },
    },
    ...overrides,
  },
});

describe("contentful service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and maps gallery entries to Photo[]", async () => {
    const mockGetEntries = vi.fn().mockResolvedValue({ items: [mockEntry()] });
    vi.mocked(createClient).mockReturnValue({
      withoutUnresolvableLinks: { getEntries: mockGetEntries },
    } as unknown as ReturnType<typeof createClient>);

    const photos = await fetchPhotos();

    expect(photos).toHaveLength(1);
    expect(photos[0]).toEqual({
      id: "entry-1",
      src: "https://images.ctfassets.net/abc/photo.jpg",
      alt: "A beautiful photo",
      location: "Paris, FR",
      date: "Jan 2024",
      type: "portrait",
      category: "Architecture",
    });
  });

  it("uses correct content type", async () => {
    const mockGetEntries = vi.fn().mockResolvedValue({ items: [] });
    vi.mocked(createClient).mockReturnValue({
      withoutUnresolvableLinks: { getEntries: mockGetEntries },
    } as unknown as ReturnType<typeof createClient>);

    await fetchPhotos();

    expect(mockGetEntries).toHaveBeenCalledWith({ content_type: "gallery" });
  });

  it("handles missing image gracefully", async () => {
    const mockGetEntries = vi
      .fn()
      .mockResolvedValue({ items: [mockEntry({ image: undefined })] });
    vi.mocked(createClient).mockReturnValue({
      withoutUnresolvableLinks: { getEntries: mockGetEntries },
    } as unknown as ReturnType<typeof createClient>);

    const photos = await fetchPhotos();

    expect(photos[0]?.src).toBe("");
  });

  it("falls back type to square for invalid values", async () => {
    const mockGetEntries = vi
      .fn()
      .mockResolvedValue({ items: [mockEntry({ type: "panorama" })] });
    vi.mocked(createClient).mockReturnValue({
      withoutUnresolvableLinks: { getEntries: mockGetEntries },
    } as unknown as ReturnType<typeof createClient>);

    const photos = await fetchPhotos();

    expect(photos[0]?.type).toBe("square");
  });

  it("throws when client fails", async () => {
    const mockGetEntries = vi.fn().mockRejectedValue(new Error("API error"));
    vi.mocked(createClient).mockReturnValue({
      withoutUnresolvableLinks: { getEntries: mockGetEntries },
    } as unknown as ReturnType<typeof createClient>);

    await expect(fetchPhotos()).rejects.toThrow("API error");
  });
});
```

- [ ] **Step 2: Run test**

```bash
npx vitest run src/__tests__/contentful-service.spec.ts
```

Expected: All 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/contentful-service.spec.ts
git commit -m "test: add Contentful service unit tests"
```

---

### Task 8: Run full test suite and lint

- [ ] **Step 1: Run all tests**

```bash
npm run test:unit
```

Expected: All existing and new tests pass.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```

Expected: No type errors.

- [ ] **Step 4: Run build**

```bash
npm run build-only
```

Expected: Build succeeds.

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "chore: fix lint and type issues"
```
