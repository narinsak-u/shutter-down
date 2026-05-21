<script setup lang="ts">
defineOptions({ name: "AppFooter" });

const year = new Date().getFullYear();
</script>

<template>
  <footer class="text-label-sm font-label-sm text-secondary text-center py-gutter">
    &copy; {{ year }} Eyes up, Shutter down &middot; Built with
    <a
      href="https://vuejs.org/"
      class="text-green-700 hover:text-primary transition-colors duration-200"
    >
      Vue
    </a>
    +
    <a href="https://contentful.com/" class="hover:text-primary transition-colors duration-200">
      Contentful
    </a>
  </footer>
</template>
