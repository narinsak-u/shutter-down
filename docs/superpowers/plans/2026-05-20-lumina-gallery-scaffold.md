# Lumina Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing Lumina Gallery scaffold to use Pinia for state management, update tests to match the current design, and polish the minimalist aesthetic.

**Architecture:** Use Pinia for centralized state management of the gallery images and lightbox state. Maintain the component-based architecture for modularity and follow TDD for verification.

**Tech Stack:** Vue 3 (Composition API), Pinia, Tailwind CSS, Vitest, Vue Test Utils.

---

### Task 1: Initialize Pinia Store

**Files:**
- Create: `src/stores/gallery.ts`
- Test: `src/__tests__/stores/gallery.spec.ts`

- [ ] **Step 1: Write the failing test for the gallery store**

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useGalleryStore } from '@/stores/gallery'

describe('Gallery Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default images', () => {
    const store = useGalleryStore()
    expect(store.photos.length).toBeGreaterThan(0)
  })

  it('filters photos by category', () => {
    const store = useGalleryStore()
    store.setFilter('Architecture')
    expect(store.filteredPhotos.every(p => p.category === 'Architecture')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit src/__tests__/stores/gallery.spec.ts`
Expected: FAIL (Store not defined)

- [ ] **Step 3: Write the Pinia store implementation**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Photo {
  id: string;
  src: string;
  alt: string;
  location: string;
  date: string;
  type: 'portrait' | 'landscape' | 'square';
  category: string;
}

export const useGalleryStore = defineStore('gallery', () => {
  const photos = ref<Photo[]>([
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
  ])
  const activeFilter = ref('all')
  const lightboxOpen = ref(false)
  const lightboxSrc = ref('')

  const filteredPhotos = computed(() => {
    if (activeFilter.value === 'all') return photos.value
    return photos.value.filter(p => p.category === activeFilter.value)
  })

  function setFilter(filter: string) {
    activeFilter.value = filter
  }

  function openLightbox(src: string) {
    lightboxSrc.value = src
    lightboxOpen.value = true
  }

  return { 
    photos, 
    activeFilter, 
    lightboxOpen, 
    lightboxSrc, 
    filteredPhotos, 
    setFilter, 
    openLightbox 
  }
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit src/__tests__/stores/gallery.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/stores/gallery.ts src/__tests__/stores/gallery.spec.ts
git commit -m "feat: add gallery store with Pinia"
```

---

### Task 2: Refactor Gallery.vue to use Pinia Store

**Files:**
- Modify: `src/components/Gallery.vue`

- [ ] **Step 1: Replace local state with Pinia store**

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useGalleryStore } from "@/stores/gallery";
import GalleryItem from "./GalleryItem.vue";
import Lightbox from "./Lightbox.vue";

const galleryStore = useGalleryStore();
const categories = ["all", "Architecture", "Nature", "Abstract", "Portrait"];

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
        @click="galleryStore.setFilter(category)"
        :class="[
          'font-label-sm text-label-sm whitespace-nowrap transition-all duration-200',
          galleryStore.activeFilter === category
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
        v-for="item in galleryStore.filteredPhotos"
        :key="item.id"
        :src="item.src"
        :alt="item.alt"
        :location="item.location"
        :date="item.date"
        :type="item.type"
        @click="galleryStore.openLightbox(item.src)"
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
  <Lightbox v-model="galleryStore.lightboxOpen" :src="galleryStore.lightboxSrc" />
</template>
```

- [ ] **Step 2: Run build to check for errors**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 3: Commit**

```bash
git add src/components/Gallery.vue
git commit -m "refactor: migrate Gallery state to Pinia"
```

---

### Task 3: Update and Fix Tests

**Files:**
- Modify: `src/__tests__/App.spec.ts`
- Create: `src/__tests__/components/Gallery.spec.ts`

- [ ] **Step 1: Fix App.spec.ts to check for LUMINA branding**

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '../App.vue'

describe('App', () => {
  it('renders properly and shows brand', () => {
    setActivePinia(createPinia())
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('LUMINA')
  })
})
```

- [ ] **Step 2: Create Gallery.spec.ts**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Gallery from '../../components/Gallery.vue'

describe('Gallery', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders all categories', () => {
    const wrapper = mount(Gallery)
    expect(wrapper.text()).toContain('Architecture')
    expect(wrapper.text()).toContain('Nature')
  })

  it('displays gallery items', () => {
    const wrapper = mount(Gallery)
    const items = wrapper.findAll('.masonry-item')
    expect(items.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 3: Run all tests**

Run: `npm run test:unit`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/App.spec.ts src/__tests__/components/Gallery.spec.ts
git commit -m "test: update and add tests for App and Gallery"
```

---

### Task 4: Final Polishing of Aesthetic

**Files:**
- Modify: `src/style.css`
- Modify: `src/components/GalleryItem.vue`

- [ ] **Step 1: Refine spacing and transitions in style.css**

```css
/* Ensure smooth transitions for reveal */
.masonry-item {
  transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Add a subtle fade-in for the entire main container */
main {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

- [ ] **Step 2: Ensure GalleryItem has the correct Geist typography classes**

```vue
<script setup lang="ts">
defineProps<{
  src: string;
  alt: string;
  location: string;
  date: string;
  type: "portrait" | "landscape" | "square";
}>();

defineEmits(["click"]);
</script>

<template>
  <div
    :class="['masonry-item group relative overflow-hidden bg-surface-container cursor-pointer', type]"
    @click="$emit('click')"
  >
    <img
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover image-zoom"
      loading="lazy"
    />
    <div class="hover-info absolute inset-0 bg-primary/10 flex flex-col justify-end p-6 pointer-events-none">
      <span class="font-label-md text-label-md text-on-primary">{{ location }}</span>
      <span class="font-label-sm text-label-sm text-on-primary/80 uppercase">{{ date }}</span>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Verify overall look and feel**

Run: `npm run build` and manually inspect `src/style.css` for any layout-breaking issues.

- [ ] **Step 4: Commit**

```bash
git add src/style.css src/components/GalleryItem.vue
git commit -m "style: polish minimalist aesthetic and reveal animations"
```
