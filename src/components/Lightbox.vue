<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  modelValue: boolean;
  src?: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const isOpen = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
    if (newValue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  },
);

watch(isOpen, (newValue) => {
  emit("update:modelValue", newValue);
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
