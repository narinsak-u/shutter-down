<script setup lang="ts">
import { ref } from "vue";

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const scrollY = ref(0);

const handleScroll = () => {
  scrollY.value = window.scrollY;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

import { onMounted, onUnmounted } from "vue";
</script>

<template>
  <header
    class="bg-surface dark:bg-background border-b border-outline-variant dark:border-on-surface-variant flex justify-between items-center w-full px-container-margin-mobile md:px-container-margin-desktop py-4 h-20 fixed top-0 z-50 transition-all duration-200 ease-out"
    :class="{ 'bg-white/80 dark:bg-background/80 backdrop-blur-md': scrollY > 50 }"
  >
    <div class="flex items-center gap-12">
      <h1
        class="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary dark:text-on-background"
      >
        LUMINA
      </h1>
      <nav class="hidden md:flex gap-8">
        <a
          href="#gallery"
          class="font-label-sm text-label-sm text-primary dark:text-on-background border-b-2 border-primary dark:border-on-background pb-1 hover:text-primary dark:hover:text-on-background transition-colors duration-200"
        >
          Gallery
        </a>
        <a
          href="#"
          class="font-label-sm text-label-sm text-secondary dark:text-on-secondary-fixed-variant pb-1 hover:text-primary dark:hover:text-on-background transition-colors duration-200"
        >
          Archive
        </a>
        <a
          href="#"
          class="font-label-sm text-label-sm text-secondary dark:text-on-secondary-fixed-variant pb-1 hover:text-primary dark:hover:text-on-background transition-colors duration-200"
        >
          About
        </a>
      </nav>
    </div>
    <div class="flex items-center gap-4">
      <span
        class="hidden sm:inline font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed-dim"
      >
        Curated 2024
      </span>
      <button
        class="md:hidden flex items-center justify-center p-2 text-primary"
        @click="toggleMenu"
        aria-label="Toggle mobile menu"
      >
        <span class="material-symbols-outlined">{{ isMenuOpen ? "close" : "menu" }}</span>
      </button>
    </div>
  </header>

  <!-- Mobile Menu -->
  <nav
    v-if="isMenuOpen"
    class="fixed top-20 left-0 right-0 bg-surface dark:bg-background border-b border-outline-variant md:hidden z-40 flex flex-col gap-4 px-container-margin-mobile py-4"
  >
    <a
      href="#gallery"
      class="font-label-sm text-label-sm text-primary dark:text-on-background hover:text-primary transition-colors duration-200"
      @click="isMenuOpen = false"
    >
      Gallery
    </a>
    <a
      href="#"
      class="font-label-sm text-label-sm text-secondary dark:text-on-secondary-fixed-variant hover:text-primary transition-colors duration-200"
    >
      Archive
    </a>
    <a
      href="#"
      class="font-label-sm text-label-sm text-secondary dark:text-on-secondary-fixed-variant hover:text-primary transition-colors duration-200"
    >
      About
    </a>
  </nav>
</template>

<style scoped></style>
