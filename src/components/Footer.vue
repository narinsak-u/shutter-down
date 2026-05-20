<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
  <footer
    class="text-label-sm font-label-sm text-secondary text-center py-gutter border-t border-outline-variant"
  >
    Eyes up, Shutter down. &copy; {{ year }} &middot; Built with
    <a
      href="https://vuejs.org/"
      class="text-green-700 hover:text-primary transition-colors duration-200"
    >
      Vue
    </a>
    .
  </footer>
</template>
