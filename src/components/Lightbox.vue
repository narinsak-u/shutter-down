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
    class="fixed inset-0 bg-white z-[100] opacity-100 pointer-events-auto transition-opacity duration-300 flex items-center justify-center p-container-margin-mobile md:p-container-margin-desktop"
  >
    <button
      class="absolute top-6 right-6 md:top-8 md:right-8 p-3 text-primary hover:opacity-60 transition-opacity duration-200"
      @click="close"
      aria-label="Close lightbox"
    >
      <span class="material-symbols-outlined text-3xl">close</span>
    </button>
    <img
      :src="src"
      class="max-h-full max-w-full object-contain"
      :alt="'Expanded gallery image'"
    />
  </div>
</template>
