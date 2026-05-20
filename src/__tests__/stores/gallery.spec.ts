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
