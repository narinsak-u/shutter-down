<script setup lang="ts">
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
