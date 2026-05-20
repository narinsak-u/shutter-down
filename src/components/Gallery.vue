<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick } from "vue";
import { useGalleryStore } from "@/stores/gallery";
import GalleryItem from "./GalleryItem.vue";
import Lightbox from "./Lightbox.vue";

const galleryStore = useGalleryStore();
const categories = ["all", "Architecture", "Nature", "Abstract", "Portrait"];

let observer: IntersectionObserver | null = null;

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

  const items = document.querySelectorAll(".masonry-item");
  items.forEach((item) => {
    observer?.observe(item);
  });
};

onMounted(() => {
  setupScrollReveal();
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

// Re-observe items when filtered list changes
watch(
  () => galleryStore.filteredPhotos,
  async () => {
    await nextTick();
    setupScrollReveal();
  },
  { deep: true },
);
</script>

<template>
  <main
    class="pt-32 pb-section-gap px-container-margin-mobile md:px-container-margin-desktop min-h-screen"
  >
    <!-- Gallery Intro Header -->
    <section class="max-w-2xl mb-8">
      <h2 class="font-headline-xl text-headline-xl mb-4">A study in contrast and light.</h2>
      <p class="font-body-lg text-body-lg text-secondary max-w-xl">
        Curated frames from a nomadic year. This archive explores the intersection of brutalist
        architecture and the softness of natural light.
      </p>
    </section>

    <!-- Category Filter Nav -->
    <nav class="flex items-center gap-8 mb-12 overflow-x-auto no-scrollbar">
      <button
        v-for="category in categories"
        :key="category"
        @click="galleryStore.setFilter(category)"
        :class="[
          'font-label-sm text-label-sm whitespace-nowrap transition-all duration-200',
          galleryStore.activeFilter === category
            ? 'text-primary border-b-2 border-primary pb-1'
            : 'text-secondary hover:text-primary',
        ]"
      >
        {{ category === "all" ? "All" : category }}
      </button>
    </nav>

    <!-- Dynamic Masonry Grid -->
    <div class="masonry-grid" id="gallery">
      <GalleryItem
        v-for="item in galleryStore.filteredPhotos"
        :key="item.id"
        :src="item.src"
        :alt="item.alt"
        :location="item.location"
        :date="item.date"
        :type="item.type"
        @click="galleryStore.openLightbox(item.src)"
      />
    </div>

    <!-- Load More Section -->
    <div class="mt-section-gap flex justify-center">
      <button
        class="px-12 py-4 border border-outline text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all duration-300 ease-out"
      >
        VIEW ARCHIVE
      </button>
    </div>
  </main>

  <!-- Lightbox Modal -->
  <Lightbox v-model="galleryStore.lightboxOpen" :src="galleryStore.lightboxSrc" />
</template>
