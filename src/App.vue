<script setup lang="ts">
/** Root application shell: renders the gallery and footer. */
import Gallery from "./components/Gallery.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <div
    class="bg-surface text-on-surface min-h-screen selection:bg-primary selection:text-on-primary"
  >
    <Gallery />
    <Footer />
  </div>
</template>
