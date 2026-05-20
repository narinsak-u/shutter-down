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
      src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80",
      alt: "Minimalist architectural facade with clean geometric lines.",
      location: "Stockholm, SE",
      date: "Sept 2023",
      type: "portrait",
      category: "Architecture",
    },
    {
      id: "2",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      alt: "Serene mountain landscape with misty valleys.",
      location: "Lofoten, NO",
      date: "Dec 2023",
      type: "landscape",
      category: "Nature",
    },
    {
      id: "3",
      src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80",
      alt: "Nature composition of organic textures and patterns.",
      location: "Reykjavik, IS",
      date: "Oct 2023",
      type: "square",
      category: "Nature",
    },
    {
      id: "4",
      src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80",
      alt: "Dramatic spiral staircase in a modern atrium.",
      location: "Milan, IT",
      date: "Mar 2024",
      type: "portrait",
      category: "Architecture",
    },
    {
      id: "5",
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      alt: "Dramatic mountain peaks emerging from clouds.",
      location: "Skye, UK",
      date: "Jan 2024",
      type: "landscape",
      category: "Nature",
    },
    {
      id: "6",
      src: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=800&q=80",
      alt: "Geometric Natureion of light and shadow.",
      location: "Atacama, CL",
      date: "May 2023",
      type: "square",
      category: "Nature",
    },
    {
      id: "7",
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
      alt: "Environmental portrait in natural light.",
      location: "Paris, FR",
      date: "Feb 2024",
      type: "portrait",
      category: "Portrait",
    },
    {
      id: "8",
      src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
      alt: "Candid street portrait with dramatic shadows.",
      location: "Tokyo, JP",
      date: "Apr 2024",
      type: "portrait",
      category: "Portrait",
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
