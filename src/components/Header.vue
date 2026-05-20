<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

defineOptions({ name: "AppHeader" });

const isMenuOpen = ref(false);
const scrollY = ref(0);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleScroll = () => {
  scrollY.value = window.scrollY;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <header
    class="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-container-margin-mobile md:px-container-margin-desktop py-4 h-20 fixed top-0 z-50 transition-all duration-200 ease-out"
    :class="{ 'bg-surface-bright/90 backdrop-blur-md': scrollY > 50 }"
  >
    <div class="flex items-center gap-12">
      <h1 class="text-headline-lg font-headline-lg text-primary tracking-tighter">LUMINA</h1>
      <nav class="hidden md:flex gap-8">
        <a
          href="#gallery"
          class="text-label-sm font-label-sm text-primary border-b-2 border-primary pb-1 transition-colors duration-200"
        >
          Gallery
        </a>
      </nav>
    </div>
    <div class="flex items-center gap-4">
      <span
        class="hidden sm:inline text-label-sm font-label-sm text-outline-variant uppercase tracking-widest"
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

  <nav
    v-if="isMenuOpen"
    class="fixed top-20 left-0 right-0 bg-surface border-b border-outline-variant md:hidden z-40 flex flex-col gap-4 px-container-margin-mobile py-4"
  >
    <a
      href="#gallery"
      class="text-label-sm font-label-sm text-primary transition-colors duration-200"
      @click="isMenuOpen = false"
    >
      Gallery
    </a>
    <a
      href="#"
      class="text-label-sm font-label-sm text-secondary hover:text-primary transition-colors duration-200"
    >
      Archive
    </a>
    <a
      href="#"
      class="text-label-sm font-label-sm text-secondary hover:text-primary transition-colors duration-200"
    >
      About
    </a>
  </nav>
</template>
