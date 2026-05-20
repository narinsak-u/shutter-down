<script setup lang="ts">
import Header from "./components/Header.vue";
import Gallery from "./components/Gallery.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <div
    class="bg-surface dark:bg-background text-on-surface dark:text-on-background selection:bg-primary selection:text-on-primary min-h-screen"
  >
    <Header />
    <Gallery />
    <Footer />
  </div>
</template>

<style scoped></style>
