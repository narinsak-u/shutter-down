import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Photo } from '@/types/gallery'
import { fetchPhotos } from '@/services/contentful'

export const useGalleryStore = defineStore('gallery', () => {
  const photos = ref<Photo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activeFilter = ref('all')
  const lightboxOpen = ref(false)
  const lightboxIndex = ref<number>(0)

  const filteredPhotos = computed(() => {
    if (activeFilter.value === 'all') return photos.value
    return photos.value.filter((p) => p.category === activeFilter.value)
  })

  function setFilter(filter: string) {
    activeFilter.value = filter
  }

  async function fetchAllPhotos() {
    loading.value = true
    error.value = null
    try {
      photos.value = await fetchPhotos()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load photos'
    } finally {
      loading.value = false
    }
  }

  return {
    photos,
    loading,
    error,
    activeFilter,
    lightboxOpen,
    lightboxIndex,
    filteredPhotos,
    setFilter,
    fetchAllPhotos,
  }
})
