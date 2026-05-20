<script setup lang="ts">
import { watch } from "vue";

interface Props {
  src?: string;
}

withDefaults(defineProps<Props>(), {
  src: "",
});

const isOpen = defineModel<boolean>({ default: false });

watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
});

const close = () => {
  isOpen.value = false;
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-white dark:bg-background z-[100] opacity-100 pointer-events-auto transition-opacity duration-300 flex items-center justify-center p-container-margin-desktop"
  >
    <button
      class="absolute top-8 right-8 p-4 text-primary hover:opacity-80 transition-opacity"
      @click="close"
      aria-label="Close lightbox"
    >
      <span class="material-symbols-outlined text-4xl">close</span>
    </button>
    <img
      :src="src"
      class="max-h-full max-w-full object-contain shadow-2xl"
      :alt="'Expanded gallery image'"
    />
  </div>
</template>

<style scoped></style>
