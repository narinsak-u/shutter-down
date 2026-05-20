<script setup lang="ts">
import Header from "./components/Header.vue";
import Gallery from "./components/Gallery.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <div class="bg-surface text-on-surface min-h-screen selection:bg-primary selection:text-on-primary">
    <Header />
    <Gallery />
    <Footer />
  </div>
</template>
