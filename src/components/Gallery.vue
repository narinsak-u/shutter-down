<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import GalleryItem from "./GalleryItem.vue";
import Lightbox from "./Lightbox.vue";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  location: string;
  date: string;
  type: "portrait" | "landscape" | "square";
  category: string;
}

const selectedCategory = ref("all");
const lightboxOpen = ref(false);
const lightboxSrc = ref("");
const currentItems = ref<(GalleryImage & { isRevealed: boolean })[]>([]);

const categories = ["all", "Architecture", "Nature", "Abstract", "Portrait"];

const galleryImages: GalleryImage[] = [
  {
    id: "1",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDknbasXn0BqRpL69-VFeAqioD_x9nj5FDk3j1rzZ_Ftg61HV1MwtQCJ7nWmEYoCCd2n_OZG0zfTGlfusqWxoauB-qeQIW3OeXwfOS9TN5O2J0pgXAVXcmLM9ErDdSlhb1qgjvcZzDHj4Z2ExvV-r04EJX1DL5aDmz1hsBYz5P9IQGZ_Jf0Fm4F4mJkqD0-7x8tWqAi3ILau5pC8GWrAyaegMPBggzi_jeX4fhv8WgXykxaqavUnlp0bA53BK8q__F2cddhLizUUp_s",
    alt: "A minimalist architectural photograph featuring a stark concrete wall set against a bright, cloudless blue sky.",
    location: "Stockholm, SE",
    date: "Sept 2023",
    type: "portrait",
    category: "Architecture",
  },
  {
    id: "2",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2CTBXpoDSYQLPuf726w4uZ6Q2wMLADk9YcBgvX3mbywPyBzQoInPnAji-k39sQeugvZtnjKUJYKKgPNPfRKTfOmuzqww3KBZV2tTl3RLhyG-83yGtAylDnlwf41GY9WmzdIK3MlKqJ_NHSumk0MW1dsYOcVoKttSajZx_9jBgDHJ0Cc2BapOX649tofOGnIxUMaT15Yl4gCXdstKNXc2JChLo2i9h0pq6Pk_EXJgUgSH8hHCJSP3cbnmgS3ELjzT_DKtGd5v6Mxkf",
    alt: "A serene landscape captured in a minimalist style, showing a calm lake reflecting a misty mountain range.",
    location: "Lofoten, NO",
    date: "Dec 2023",
    type: "landscape",
    category: "Nature",
  },
  {
    id: "3",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeBnpWvZUQSv7MiU5ZHUHdZNLi7zrNqGNIykgVPdGh1JbhH_zYzwqHCjCYP9O97GTlNH73FhsSgraatUCFF5JbfSVi3hkOGr5NjQLYDDc1t5LWVqlFXNcaxTOvILo5Sos2s8xyOsctvBG8AUmLcfeqMDt4zwCPqTclwyfeZuFRpUpXOgLfoxyAxCf1Inu-RK9T_UM5sErvjuaSQ12FdJj6J_pvNkHIoxDXokoU9xcfIX8rDxMDevTzC52ixmuO6bW1xOnDDIQHRj-m",
    alt: "Close-up detail of an organic texture, possibly a rock face or dried earth, rendered in high-contrast black and white.",
    location: "Reykjavik, IS",
    date: "Oct 2023",
    type: "square",
    category: "Abstract",
  },
  {
    id: "4",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqKcuk7mx2ZZRthH_Idl_Gf8fZPW3ZEeW6yHOKDt7qD28ieUoqq1ox9BizoDdmOE-nnKbm-RGNDVcjQz_ZUXheOi7CyqGzedMfwcEplvcJVPdjArEzXvQ4ViGf7xjh1kBZDVMbYfR8REG4VNRmJOCeQumhEnKh1IkRAmbmAFhOdt8zjFgqlWRFKMZHyQTr9B7yu-broh7_c0JcvGyj_My1ubyVfKHdTKFHLK9laqHv2OQpp0FdqbLOHF5PAQa8Tr3yRZuMLbbzyGU_",
    alt: "A high-key fashion-inspired architectural shot showing a person walking through a vast, white marble hallway.",
    location: "Milan, IT",
    date: "Mar 2024",
    type: "portrait",
    category: "Architecture",
  },
  {
    id: "5",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzQkpLu65CY2BfnWoq9psEIJnVngQp5f1-8yG1ADXxxvnxqElTsfNdGfhlinMtLvKw_IP3tkUSJyUHdH80NA9Vq595pr6l0LFY4q7Y0uGo9zwcRpBWlcha_M_E5TFIBrGlJEItLUTVMdQoj0yERwgzFxJJqouyoDRJHxnUNiD1-9SlTDlLMAjQfKi1GPXJIJrZYYZ8L2I2Ypo_Fj0XCUYWbPwtuSWROnKuFryrTMiKXEWsJU00EhgtMHb2O6AWc3YGVKrEdLaPkjsT",
    alt: "A striking minimalist seascape at dusk, where the horizon line is almost invisible due to thick coastal fog.",
    location: "Skye, UK",
    date: "Jan 2024",
    type: "landscape",
    category: "Nature",
  },
  {
    id: "6",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuARa81t_qaDctA5vilRhftXNbd-HWAIWL7oJKJNzPTgEB-lLN5F2bxFRQ9rrP6GymozWfSyKyfwgf5qoPkS_tKcnUQg79uueoTnYptl3rqH1gDdnSpykmnGsGAqmC4G6hwFPsbVxtkaxOCzgo-wG5IpFZDRt3zhFpjt5Vlaguc8Xx6a0VMnpgNG2qqr50VPQ23Q7JYh_08QHq5-IkcH0p2xgRRphbLM9VWYRcbwbvlMwX8fS4LcC4DWr1BlIKtI2nM-pz8TFmFe_1vX",
    alt: "A celestial-themed minimalist photograph showing a single star shining through dark, wispy clouds in a midnight black sky.",
    location: "Atacama, CL",
    date: "May 2023",
    type: "square",
    category: "Abstract",
  },
];

const filteredImages = () => {
  if (selectedCategory.value === "all") {
    return galleryImages;
  }
  return galleryImages.filter((img) => img.category === selectedCategory.value);
};

const openLightbox = (src: string) => {
  lightboxSrc.value = src;
  lightboxOpen.value = true;
};

const setupScrollReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            const item = entry.target as HTMLElement;
            item.classList.remove("opacity-0", "translate-y-8");
            item.classList.add("opacity-100");
            item.style.transform = "translateY(0)";
          }, index * 100);
        }
      });
    },
    { threshold: 0.1 },
  );

  const items = document.querySelectorAll(".masonry-item");
  items.forEach((item) => {
    observer.observe(item);
  });

  return () => observer.disconnect();
};

onMounted(() => {
  currentItems.value = filteredImages().map((img) => ({ ...img, isRevealed: false }));
  setupScrollReveal();
});
</script>

<template>
  <main
    class="pt-32 pb-section-gap px-container-margin-mobile md:px-container-margin-desktop min-h-screen"
  >
    <!-- Gallery Intro Header -->
    <section class="max-w-2xl mb-8">
      <h2 class="font-headline-xl text-headline-xl mb-4">A study in contrast and light.</h2>
      <p class="font-body-lg text-body-lg text-secondary max-w-xl">
        Curated frames from a nomadic year. This archive explores the intersection of brutalist
        architecture and the softness of natural light.
      </p>
    </section>

    <!-- Category Filter Nav -->
    <nav class="flex items-center gap-8 mb-12 overflow-x-auto no-scrollbar">
      <button
        v-for="category in categories"
        :key="category"
        @click="selectedCategory = category"
        :class="[
          'font-label-sm text-label-sm whitespace-nowrap transition-all duration-200',
          selectedCategory === category
            ? 'text-primary border-b-2 border-primary pb-1'
            : 'text-secondary hover:text-primary',
        ]"
      >
        {{ category === "all" ? "All" : category }}
      </button>
    </nav>

    <!-- Dynamic Masonry Grid -->
    <div class="masonry-grid" id="gallery">
      <GalleryItem
        v-for="item in filteredImages()"
        :key="item.id"
        :src="item.src"
        :alt="item.alt"
        :location="item.location"
        :date="item.date"
        :type="item.type"
        @click="openLightbox(item.src)"
      />
    </div>

    <!-- Load More Section -->
    <div class="mt-section-gap flex justify-center">
      <button
        class="px-12 py-4 border border-outline text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all duration-300 ease-out"
      >
        VIEW ARCHIVE
      </button>
    </div>
  </main>

  <!-- Lightbox Modal -->
  <Lightbox v-model="lightboxOpen" :src="lightboxSrc" />
</template>

<style scoped></style>
