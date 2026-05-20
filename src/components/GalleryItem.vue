<script setup lang="ts">
defineProps<{
  src: string;
  alt: string;
  location: string;
  date: string;
  type: "portrait" | "landscape" | "square";
}>();

defineEmits(["click"]);
</script>

<template>
  <div
    :class="['masonry-item group relative overflow-hidden bg-surface-container cursor-pointer', type]"
    @click="$emit('click')"
  >
    <img
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover image-zoom"
      loading="lazy"
    />
    <div class="hover-info absolute inset-0 bg-primary/10 flex flex-col justify-end p-6 pointer-events-none">
      <span class="font-label-md text-label-md text-on-primary">{{ location }}</span>
      <span class="font-label-sm text-label-sm text-on-primary/80 uppercase">{{ date }}</span>
    </div>
  </div>
</template>
