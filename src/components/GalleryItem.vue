<script setup lang="ts">
import { ref } from "vue";

interface Props {
  src: string;
  alt: string;
  location: string;
  date: string;
  type: "portrait" | "landscape" | "square";
}

defineProps<Props>();

const emit = defineEmits<{
  click: [];
}>();

const isLoading = ref(true);

const handleImageLoad = () => {
  isLoading.value = false;
};
</script>

<template>
  <div
    :class="[
      'masonry-item',
      type,
      'group relative overflow-hidden bg-surface-container opacity-0 translate-y-8 transition-all duration-700 ease-out cursor-pointer',
    ]"
    @click="emit('click')"
  >
    <img
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover image-zoom transition-transform duration-500 ease-out"
      @load="handleImageLoad"
    />
    <div
      class="hover-info absolute inset-0 bg-primary/20 flex flex-col justify-end p-6 pointer-events-none"
    >
      <span class="font-label-md text-label-md text-on-primary">{{ location }}</span>
      <span class="font-label-sm text-label-sm text-on-primary/80 uppercase">{{ date }}</span>
    </div>
  </div>
</template>

<style scoped></style>
