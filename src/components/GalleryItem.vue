<script setup lang="ts">
/** A single photo card with image, location, and date. Emits `click` to open the lightbox. */
defineProps<{
  src: string;
  thumbSrc: string;
  alt: string;
  location: string;
  date: string;
  imageWidth?: number;
  imageHeight?: number;
  prioritize?: boolean;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <button
    class="gallery-item group relative block w-full cursor-pointer border-0 bg-transparent p-0 text-left opacity-0 translate-y-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    type="button"
    :aria-label="alt"
    @click="$emit('click')"
    @keydown.enter.prevent="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <img
      :src="thumbSrc"
      :alt="alt"
      :width="imageWidth"
      :height="imageHeight"
      :loading="prioritize ? 'eager' : 'lazy'"
      :fetchpriority="prioritize ? 'high' : undefined"
      class="w-full h-auto block image-zoom"
      draggable="false"
    />
    <div class="pt-3 pb-2">
      <p class="text-label-md font-label-md text-primary">{{ location }}</p>
      <p class="text-label-sm font-label-sm text-secondary uppercase mt-1">{{ date }}</p>
    </div>
  </button>
</template>
