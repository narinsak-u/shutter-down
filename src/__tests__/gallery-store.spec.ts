import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGalleryStore } from '@/stores/gallery'
import type { Photo } from '@/types/gallery'

vi.mock('@/services/contentful', () => ({
  fetchPhotos: vi.fn<() => Promise<Photo[]>>(),
}))

const { fetchPhotos } = await import('@/services/contentful')

const mockPhotos: Photo[] = [
  {
    id: '1',
    src: 'https://images.ctfassets.net/abc/image.jpg',
    alt: 'Test photo',
    location: 'Test, Location',
    date: 'Jan 2024',
    type: 'landscape',
    category: 'Nature',
  },
]

describe('galleryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts with empty photos, not loading, no error', () => {
    const store = useGalleryStore()
    expect(store.photos).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets photos on successful fetch', async () => {
    vi.mocked(fetchPhotos).mockResolvedValue(mockPhotos)
    const store = useGalleryStore()
    await store.fetchAllPhotos()
    expect(store.photos).toEqual(mockPhotos)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets error on failed fetch', async () => {
    vi.mocked(fetchPhotos).mockRejectedValue(new Error('Network error'))
    const store = useGalleryStore()
    await store.fetchAllPhotos()
    expect(store.photos).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe('Network error')
  })

  it('sets loading during fetch', async () => {
    let resolvePromise!: (photos: Photo[]) => void
    vi.mocked(fetchPhotos).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )
    const store = useGalleryStore()
    const promise = store.fetchAllPhotos()
    expect(store.loading).toBe(true)
    resolvePromise(mockPhotos)
    await promise
    expect(store.loading).toBe(false)
  })
})
