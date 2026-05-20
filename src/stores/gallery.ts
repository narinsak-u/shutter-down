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
