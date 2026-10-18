<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick, ref } from "vue";
import { useGalleryStore } from "@/stores/gallery";
import GalleryItem from "./GalleryItem.vue";
import Lightbox from "./Lightbox.vue";

defineOptions({ name: "GallerySection" });

/** Main gallery section: fetches photos, handles filtering, infinite scroll, and scroll-reveal animations. */
const galleryStore = useGalleryStore();
const categories = ["all", "Architecture", "Nature", "Portrait"];

const openPhoto = (index: number) => {
  galleryStore.lightboxIndex = index;
  galleryStore.lightboxOpen = true;
};

function scrollCategoryNavigation(direction: -1 | 1, event: KeyboardEvent): void {
  const navigation = event.currentTarget;
  if (navigation instanceof HTMLElement) {
    navigation.scrollLeft += direction * navigation.clientWidth;
  }
}

/** Reference to the sentinel element at the end of the gallery—used to trigger infinite scroll. */
const sentinelRef = ref<HTMLElement | null>(null);
const MASONRY_GAP = 24;
const pendingImageLoads = new WeakSet<HTMLImageElement>();
let layoutFrame = 0;
let gridResizeObserver: ResizeObserver | null = null;
const pendingPositionedItems = new Set<HTMLElement>();

function scheduleMasonryLayout(): void {
  if (layoutFrame) return;
  layoutFrame = requestAnimationFrame(() => {
    layoutFrame = 0;
    layoutMasonry();
  });
}

function revealGalleryItemAfterLayout(el: Element): void {
  const item = el as HTMLElement;
  item.style.visibility = "hidden";
  pendingPositionedItems.add(item);
  scheduleMasonryLayout();
}

/** IntersectionObserver instance for scroll-reveal animation on gallery items. */
let observer: IntersectionObserver | null = null;

/** IntersectionObserver instance for infinite scroll—detects when sentinel reaches viewport. */
let loadMoreObserver: IntersectionObserver | null = null;

function getColumnCount(): number {
  const width = window.innerWidth;
  if (width <= 400) return 1;
  if (width <= 600) return 2;
  if (width <= 900) return 3;
  return 4;
}
const initiallyVisiblePhotoCount = getColumnCount();

/** Excludes filtered-out cards that TransitionGroup keeps during its leave animation. */
function getActiveGalleryItems(grid: HTMLElement): HTMLElement[] {
  const activeIds = new Set(galleryStore.filteredPhotos.map((photo) => photo.id));
  return [...grid.querySelectorAll<HTMLElement>(".gallery-item")].filter((item) =>
    activeIds.has(item.dataset.photoId ?? ""),
  );
}

/** Places cards in source order into the shortest column using their rendered heights. */
function layoutMasonry(): void {
  const grid = document.getElementById("gallery");
  if (!grid) return;

  const items = getActiveGalleryItems(grid);
  if (!items.length) {
    grid.style.height = "0px";
    pendingPositionedItems.clear();
    return;
  }

  const columns = getColumnCount();
  const columnWidth = (grid.clientWidth - MASONRY_GAP * (columns - 1)) / columns;
  if (columnWidth <= 0) return;

  items.forEach((item) => {
    item.style.width = `${columnWidth}px`;

    const image = item.querySelector("img");
    if (image && !image.complete && !pendingImageLoads.has(image)) {
      pendingImageLoads.add(image);
      image.addEventListener(
        "load",
        () => {
          pendingImageLoads.delete(image);
          scheduleMasonryLayout();
        },
        { once: true },
      );
    }
  });

  const itemHeights = items.map((item) => item.offsetHeight);
  const columnHeights = Array.from({ length: columns }, () => 0);

  items.forEach((item, index) => {
    let column = 0;
    for (let candidate = 1; candidate < columnHeights.length; candidate += 1) {
      if ((columnHeights[candidate] ?? 0) < (columnHeights[column] ?? 0)) column = candidate;
    }

    const top = columnHeights[column] ?? 0;
    item.style.left = `${column * (columnWidth + MASONRY_GAP)}px`;
    item.style.top = `${top}px`;
    columnHeights[column] = top + (itemHeights[index] ?? 0) + MASONRY_GAP;
  });

  grid.style.height = `${Math.max(...columnHeights) - MASONRY_GAP}px`;
  for (const item of pendingPositionedItems) {
    if (item.isConnected) {
      item.style.visibility = "";
      item.classList.remove("opacity-0", "translate-y-8");
    }
  }
  pendingPositionedItems.clear();
}

/** Sets up infinite scroll: loads more photos when sentinel enters viewport with 200px margin. */
const setupLoadMore = () => {
  if (loadMoreObserver) loadMoreObserver.disconnect();
  const el = sentinelRef.value;
  if (!el) return;
  loadMoreObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && galleryStore.hasMore && !galleryStore.loadingMore) {
        galleryStore.loadMore();
      }
    },
    { rootMargin: "200px" },
  );
  loadMoreObserver.observe(el);
};

/** Sets up scroll-reveal animations: staggered fade-in and slide-up effect for gallery items as they enter viewport. */
const setupScrollReveal = () => {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            const item = entry.target as HTMLElement;
            item.classList.remove("opacity-0", "translate-y-8");
            item.classList.add("opacity-100");
            item.style.transform = "translateY(0)";
          }, index * 100);
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  const grid = document.getElementById("gallery");
  if (!grid) return;

  const items = getActiveGalleryItems(grid);
  items.forEach((item) => {
    observer?.observe(item);
  });
};

/** Initializes gallery on component mount: fetches photos and sets up scroll-reveal animations. */
onMounted(() => {
  galleryStore.fetchPhotos();
  window.addEventListener("resize", scheduleMasonryLayout);
  setupScrollReveal();
});

/** Cleans up observers on component unmount to prevent memory leaks. */
onUnmounted(() => {
  if (observer) observer.disconnect();
  if (loadMoreObserver) loadMoreObserver.disconnect();
  if (gridResizeObserver) gridResizeObserver.disconnect();
  window.removeEventListener("resize", scheduleMasonryLayout);
  if (layoutFrame) cancelAnimationFrame(layoutFrame);
});

/** Watches filtered photos: re-runs scroll-reveal and infinite scroll setup when filter changes or photos load. */
watch(
  () => galleryStore.filteredPhotos,
  async () => {
    await nextTick();
    scheduleMasonryLayout();
    const grid = document.getElementById("gallery");
    if (grid && !gridResizeObserver) {
      gridResizeObserver = new ResizeObserver(scheduleMasonryLayout);
      gridResizeObserver.observe(grid);
    }
    setupScrollReveal();
    setupLoadMore();
  },
  { deep: true },
);
</script>

<template>
  <main
    class="mx-auto min-h-screen w-full max-w-[1600px] px-4 pt-20 pb-section-gap sm:px-6 lg:px-10 2xl:px-16"
  >
    <section class="mb-16 md:mb-20 max-w-4xl">
      <h1 class="mb-6 text-headline-xl font-pacifico text-primary">
        Eyes up, shutter down. <span aria-hidden="true">📷</span>
      </h1>
      <p class="text-body-md font-body-md text-secondary max-w-xl">
        Walk around, frame the shot, and immediately move on to the next thing without overthinking
        it.
      </p>
    </section>

    <nav
      aria-label="Photo categories"
      tabindex="0"
      class="mb-12 flex items-center gap-8 overflow-x-auto
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      @keydown.left.prevent="scrollCategoryNavigation(-1, $event)"
      @keydown.right.prevent="scrollCategoryNavigation(1, $event)"
    >
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        :aria-pressed="galleryStore.activeFilter === category"
        @click="galleryStore.setFilter(category)"
        :class="[
          'text-label-sm cursor-pointer font-label-sm whitespace-nowrap transition-all duration-200 ease-out pb-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
          galleryStore.activeFilter === category
            ? 'text-primary border-b-2 border-primary'
            : 'text-secondary hover:text-primary',
        ]"
      >
        {{ category === "all" ? "All Work" : category }}
      </button>
    </nav>

    <p
      v-if="galleryStore.loading && galleryStore.photos.length === 0"
      class="my-16 rounded-md border border-outline-variant bg-surface-bright px-6 py-12 text-center text-body-md font-body-md text-secondary"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      Loading photos…
    </p>

    <div
      v-else-if="galleryStore.error && galleryStore.photos.length === 0"
      class="my-16 rounded-md border border-outline-variant bg-surface-bright px-6 py-12 text-center"
      role="alert"
    >
      <p class="text-body-md font-body-md text-primary">{{ galleryStore.error }}</p>
      <button
        class="mt-4 text-label-sm font-label-sm text-primary underline underline-offset-4 cursor-pointer"
        @click="galleryStore.fetchPhotos(true)"
      >
        Try again
      </button>
    </div>

    <div
      v-if="galleryStore.error && galleryStore.photos.length > 0"
      class="my-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-md border border-outline-variant px-4 py-3 text-center"
      role="alert"
    >
      <p class="text-label-md font-label-md text-primary">{{ galleryStore.error }}</p>
      <button
        class="text-label-sm font-label-sm text-primary underline underline-offset-4 cursor-pointer"
        @click="galleryStore.fetchPhotos(true)"
      >
        Try again
      </button>
    </div>

    <template
      v-if="galleryStore.photos.length > 0 || (!galleryStore.loading && !galleryStore.error)"
    >
      <TransitionGroup
        name="gallery"
        tag="div"
        class="gallery-grid"
        id="gallery"
        @enter="revealGalleryItemAfterLayout"
      >
        <GalleryItem
          v-for="(item, index) in galleryStore.filteredPhotos"
          :key="item.id"
          :data-photo-id="item.id"
          :src="item.src"
          :thumbSrc="item.thumbSrc"
          :alt="item.alt"
          :location="item.location"
          :date="item.date"
          :imageWidth="item.imageWidth"
          :imageHeight="item.imageHeight"
          :prioritize="index < initiallyVisiblePhotoCount"
          @click="openPhoto(index)"
        />
      </TransitionGroup>

      <div
        v-if="galleryStore.filteredPhotos.length === 0"
        class="my-16 rounded-md border border-outline-variant bg-surface-bright px-6 py-12 text-center"
        role="status"
      >
        <p class="text-body-md font-body-md text-secondary">No photos in this category.</p>
      </div>

      <div ref="sentinelRef" v-if="galleryStore.hasMore" class="h-px" />

      <p
        v-if="galleryStore.loadingMore"
        class="py-8 text-center text-label-md font-label-md text-secondary"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Loading more photos…
      </p>
    </template>

  </main>

  <Lightbox
    v-model="galleryStore.lightboxOpen"
    :items="galleryStore.filteredPhotos"
    v-model:index="galleryStore.lightboxIndex"
  />
</template>
