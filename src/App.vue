<script setup lang="ts">
/** Root shell for the public gallery and the embedded Contentful Page app. */
import { shallowRef } from "vue";
import { init as initContentfulApp } from "@contentful/app-sdk";
import type { PageAppSDK } from "@contentful/app-sdk";
import { RouterView } from "vue-router";
import ContentfulAdmin from "./components/ContentfulAdmin.vue";
import Footer from "./components/Footer.vue";

const embeddedInContentful = window.self !== window.top;
const contentfulSdk = shallowRef<PageAppSDK | null>(null);

if (embeddedInContentful) {
  initContentfulApp((sdk) => {
    contentfulSdk.value = sdk as PageAppSDK;
  });
}
</script>

<template>
  <div
    class="bg-surface text-on-surface min-h-screen selection:bg-primary selection:text-on-primary"
  >
    <ContentfulAdmin v-if="embeddedInContentful && contentfulSdk" :sdk="contentfulSdk" />
    <p v-else-if="embeddedInContentful" class="p-8 text-body-md font-body-md text-secondary">Loading Contentful app...</p>
    <template v-else>
      <RouterView />
      <Footer />
    </template>
  </div>
</template>
