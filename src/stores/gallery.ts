import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Photo } from '@/types/gallery'

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
    {
      id: "9",
      src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
      alt: "Lush green forest canopy with sunlight filtering through.",
      location: "Olympic, US",
      date: "Jun 2024",
      type: "landscape",
      category: "Nature",
    },
    {
      id: "10",
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      alt: "Sunlit leaves in a dense woodland.",
      location: "Black Forest, DE",
      date: "Jul 2024",
      type: "square",
      category: "Nature",
    },
    {
      id: "11",
      src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      alt: "Misty river winding through a valley at dawn.",
      location: "Dolomites, IT",
      date: "Aug 2024",
      type: "landscape",
      category: "Nature",
    },
    {
      id: "12",
      src: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80",
      alt: "Modern glass skyscraper reflecting the sky.",
      location: "New York, US",
      date: "May 2024",
      type: "portrait",
      category: "Architecture",
    },
    {
      id: "13",
      src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
      alt: "Minimalist concrete structure with clean lines.",
      location: "Berlin, DE",
      date: "Mar 2024",
      type: "square",
      category: "Architecture",
    },
    {
      id: "14",
      src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      alt: "Focused portrait of a creative professional.",
      location: "London, UK",
      date: "Sep 2024",
      type: "portrait",
      category: "Portrait",
    },
    {
      id: "15",
      src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80",
      alt: "Candid street style portrait in warm light.",
      location: "Lisbon, PT",
      date: "Oct 2024",
      type: "portrait",
      category: "Portrait",
    },
    {
      id: "16",
      src: "https://images.unsplash.com/photo-1763046527215-0e35cfc1d518?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80",
      alt: "Dramatic coastal cliffs meeting the ocean.",
      location: "Algarve, PT",
      date: "Nov 2024",
      type: "landscape",
      category: "Nature",
    },
    {
      id: "17",
      src: "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=800&q=80",
      alt: "Starry night sky above a mountain silhouette.",
      location: "Banff, CA",
      date: "Dec 2024",
      type: "landscape",
      category: "Nature",
    },
    {
      id: "18",
      src: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&q=80",
      alt: "Symmetrical interior of a grand museum.",
      location: "Paris, FR",
      date: "Jan 2025",
      type: "landscape",
      category: "Architecture",
    },
    {
      id: "19",
      src: "https://images.unsplash.com/photo-1581200304783-67d086ad67bf?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80",
      alt: "Golden hour cityscape panorama.",
      location: "San Francisco, US",
      date: "Feb 2025",
      type: "landscape",
      category: "Architecture",
    },
    {
      id: "20",
      src: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
      alt: "Solitary tree in an open field at sunset.",
      location: "Tuscany, IT",
      date: "Mar 2025",
      type: "landscape",
      category: "Nature",
    },
  ])

  const activeFilter = ref('all')
  const lightboxOpen = ref(false)
  const lightboxIndex = ref<number>(0)

  const filteredPhotos = computed(() => {
    if (activeFilter.value === 'all') return photos.value
    return photos.value.filter(p => p.category === activeFilter.value)
  })

  function setFilter(filter: string) {
    activeFilter.value = filter
  }

  return {
    photos,
    activeFilter,
    lightboxOpen,
    lightboxIndex,
    filteredPhotos,
    setFilter,
  }
})
