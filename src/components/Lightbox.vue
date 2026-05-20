<script setup lang="ts">
import { watch, onUnmounted } from "vue";
import { useGalleryStore } from "@/stores/gallery";

const galleryStore = useGalleryStore();

const isOpen = defineModel<boolean>({ default: false });

watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);
  } else {
    document.body.style.overflow = "auto";
    window.removeEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowLeft") galleryStore.prevPhoto();
  else if (e.key === "ArrowRight") galleryStore.nextPhoto();
  else if (e.key === "Escape") close();
}

const close = () => {
  isOpen.value = false;
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-white z-[100] opacity-100 pointer-events-auto transition-opacity duration-300 flex items-center justify-center"
  >
    <button
      class="absolute top-6 cursor-pointer right-6 md:top-8 md:right-8 p-3 text-primary hover:opacity-60 transition-opacity duration-200 z-10"
      @click="close"
      aria-label="Close lightbox"
    >
      <span class="material-symbols-outlined text-3xl">close</span>
    </button>

    <button
      v-if="galleryStore.filteredPhotos.length > 1"
      class="absolute left-4 cursor-pointer md:left-8 top-1/2 -translate-y-1/2 p-3 text-primary hover:opacity-60 transition-opacity duration-200 z-10"
      @click="galleryStore.prevPhoto"
      aria-label="Previous image"
    >
      <span class="material-symbols-outlined text-3xl">chevron_left</span>
    </button>

    <img
      :src="galleryStore.lightboxSrc"
      class="max-h-full max-w-full object-contain p-container-margin-mobile md:p-container-margin-desktop"
      alt="Expanded gallery image"
    />

    <button
      v-if="galleryStore.filteredPhotos.length > 1"
      class="absolute right-4 cursor-pointer md:right-8 top-1/2 -translate-y-1/2 p-3 text-primary hover:opacity-60 transition-opacity duration-200 z-10"
      @click="galleryStore.nextPhoto"
      aria-label="Next image"
    >
      <span class="material-symbols-outlined text-3xl">chevron_right</span>
    </button>
  </div>
</template>
