<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick } from "vue";
import { useGalleryStore } from "@/stores/gallery";
import GalleryItem from "./GalleryItem.vue";
import Lightbox from "./Lightbox.vue";

defineOptions({ name: "GallerySection" });

const galleryStore = useGalleryStore();
const categories = ["all", "Architecture", "Nature", "Portrait"];

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

  const items = document.querySelectorAll(".gallery-item");
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
    class="pt-20 pb-section-gap px-container-margin-mobile md:px-container-margin-desktop min-h-screen"
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

    <div v-if="galleryStore.filteredPhotos.length === 0" class="text-center py-20">
      <p class="text-body-lg font-body-lg text-secondary">No images in this category yet.</p>
    </div>

    <!-- <div class="mt-section-gap flex justify-center">
      <button
        class="px-12 py-4 border border-outline text-primary text-label-md font-label-md hover:border-primary transition-all duration-200 ease-out"
      >
        VIEW ARCHIVE
      </button>
    </div> -->
  </main>

  <Lightbox v-model="galleryStore.lightboxOpen" :src="galleryStore.lightboxSrc" />
</template>
