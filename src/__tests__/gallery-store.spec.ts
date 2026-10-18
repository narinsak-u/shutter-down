import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGalleryStore } from '@/stores/gallery'
import type { Photo } from '@/types/gallery'
import type { FetchPhotosResult } from '@/services/contentful'
import { setCache } from '@/services/cache'

vi.mock('@/services/contentful', () => ({
  fetchPhotos: vi.fn<() => Promise<FetchPhotosResult>>(),
}))

const { fetchPhotos } = await import('@/services/contentful')

const mockPhotos: Photo[] = [
  {
    id: '1',
    thumbSrc: 'https://images.ctfassets.net/abc/image.jpg?w=600&fit=thumb&fm=webp',
    src: 'https://images.ctfassets.net/abc/image.jpg?w=1600&fm=webp',
    alt: 'Test photo',
    location: 'Test, Location',
    date: 'Jan 2024',
    type: 'landscape',
    category: 'Nature',
  },
]

const mockPage2: Photo[] = [
  {
    id: '2',
    thumbSrc: 'https://images.ctfassets.net/abc/image2.jpg?w=600&fit=thumb&fm=webp',
    src: 'https://images.ctfassets.net/abc/image2.jpg?w=1600&fm=webp',
    alt: 'Another photo',
    location: 'Test, Place',
    date: 'Feb 2024',
    type: 'portrait',
    category: 'Architecture',
  },
]

describe('galleryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    const entries = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      get length() { return entries.size },
      clear: () => entries.clear(),
      getItem: (key: string) => entries.get(key) ?? null,
      key: (index: number) => [...entries.keys()][index] ?? null,
      removeItem: (key: string) => entries.delete(key),
      setItem: (key: string, value: string) => entries.set(key, String(value)),
    } satisfies Storage)
    localStorage.clear()
  })

  it('starts with empty photos, not loading, no error', () => {
    const store = useGalleryStore()
    expect(store.photos).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets photos on successful initial fetch', async () => {
    vi.mocked(fetchPhotos).mockResolvedValue({ photos: mockPhotos, total: 2 })
    const store = useGalleryStore()
    await store.fetchPhotos()
    expect(store.photos).toEqual(mockPhotos)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets error on failed fetch', async () => {
    vi.mocked(fetchPhotos).mockRejectedValue(new Error('Network error'))
    const store = useGalleryStore()
    await store.fetchPhotos()
    expect(store.photos).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe('Network error')
  })

  it('sets loading during initial fetch', async () => {
    let resolvePromise!: (value: FetchPhotosResult | PromiseLike<FetchPhotosResult>) => void
    vi.mocked(fetchPhotos).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )
    const store = useGalleryStore()
    const promise = store.fetchPhotos()
    expect(store.loading).toBe(true)
    resolvePromise({ photos: mockPhotos, total: 2 })
    await promise
    expect(store.loading).toBe(false)
  })

  it('appends photos on loadMore and tracks hasMore', async () => {
    vi.mocked(fetchPhotos).mockResolvedValueOnce({ photos: mockPhotos, total: 2 })
    vi.mocked(fetchPhotos).mockResolvedValueOnce({ photos: mockPage2, total: 2 })

    const store = useGalleryStore()
    await store.fetchPhotos()
    expect(store.photos).toEqual(mockPhotos)
    expect(store.hasMore).toBe(true)

    await store.loadMore()
    expect(store.photos).toEqual([...mockPhotos, ...mockPage2])
    expect(store.hasMore).toBe(false)
  })

  it('does not loadMore when hasMore is false', async () => {
    vi.mocked(fetchPhotos).mockResolvedValue({ photos: mockPhotos, total: 1 })

    const store = useGalleryStore()
    await store.fetchPhotos()
    expect(store.hasMore).toBe(false)

    await store.loadMore()
    expect(fetchPhotos).toHaveBeenCalledTimes(1)
  })

  it('returns cached data from fresh cache without API call and preserves pagination', async () => {
    setCache('gallery-photos', { photos: mockPhotos, total: 10 })
    const store = useGalleryStore()
    await store.fetchPhotos()
    expect(store.photos).toEqual(mockPhotos)
    expect(store.hasMore).toBe(true)
    expect(vi.mocked(fetchPhotos)).not.toHaveBeenCalled()
    vi.mocked(fetchPhotos).mockResolvedValue({ photos: mockPage2, total: 10 })
    await store.loadMore()
    expect(vi.mocked(fetchPhotos)).toHaveBeenLastCalledWith(1, 9)
    expect(store.photos).toEqual([...mockPhotos, ...mockPage2])
  })

  it('bypasses cache on forced refresh and exposes request failures', async () => {
    setCache('gallery-photos', { photos: mockPhotos, total: 1 })
    vi.mocked(fetchPhotos).mockRejectedValue(new Error('Network error'))

    const store = useGalleryStore()
    await store.fetchPhotos(true)

    expect(vi.mocked(fetchPhotos)).toHaveBeenCalledWith(0, 9)
    expect(store.photos).toEqual([])
    expect(store.error).toBe('Network error')
  })

  it('shows stale cache while revalidating, then replaces displayed data', async () => {
    const staleEntry = JSON.stringify({
      timestamp: Date.now() - 900_001,
      data: { photos: mockPhotos, total: 10 },
    })
    localStorage.setItem('cache:gallery-photos', staleEntry)

    let resolveDeferred!: (value: FetchPhotosResult) => void
    const deferred = new Promise<FetchPhotosResult>((resolve) => {
      resolveDeferred = resolve
    })
    vi.mocked(fetchPhotos).mockReturnValue(deferred)

    const store = useGalleryStore()
    store.setFilter('square')
    await store.fetchPhotos()

    expect(store.photos).toEqual(mockPhotos)
    expect(store.filteredPhotos).toEqual(mockPhotos.filter((photo) => photo.category === 'square'))
    expect(store.loading).toBe(true)
    expect(vi.mocked(fetchPhotos)).toHaveBeenCalledWith(0, 9)

    resolveDeferred({ photos: mockPage2, total: 1 })
    await deferred
    await Promise.resolve()

    expect(store.photos).toEqual(mockPage2)
    expect(store.filteredPhotos).toEqual(mockPage2.filter((photo) => photo.category === 'square'))
    expect(store.loading).toBe(false)
    expect(store.hasMore).toBe(false)
  })
  it('keeps stale-cache pagination after refresh failure without reloading page zero', async () => {
    const cachedPhotos = Array.from({ length: 9 }, (_, index) => ({
      ...mockPhotos[0]!,
      id: `cached-${index}`,
    }))
    localStorage.setItem('cache:gallery-photos', JSON.stringify({
      timestamp: Date.now() - 900_001,
      data: { photos: cachedPhotos, total: 18 },
    }))
    vi.mocked(fetchPhotos)
      .mockRejectedValueOnce(new Error('refresh failed'))
      .mockResolvedValueOnce({ photos: mockPage2, total: 18 })

    const store = useGalleryStore()
    await store.fetchPhotos()
    await vi.waitFor(() => expect(store.loading).toBe(false))
    expect(store.photos).toEqual(cachedPhotos)
    expect(store.error).toBe('refresh failed')

    await store.loadMore()

    expect(vi.mocked(fetchPhotos)).toHaveBeenNthCalledWith(2, 9, 9)
    expect(store.photos).toEqual([...cachedPhotos, ...mockPage2])
    expect(new Set(store.photos.map((photo) => photo.id)).size).toBe(store.photos.length)
  })

  it('does not load a page while stale data is being refreshed', async () => {
    const cachedPhotos = Array.from({ length: 9 }, (_, index) => ({
      ...mockPhotos[0]!,
      id: `cached-${index}`,
    }))
    localStorage.setItem('cache:gallery-photos', JSON.stringify({
      timestamp: Date.now() - 900_001,
      data: { photos: cachedPhotos, total: 18 },
    }))
    let rejectRefresh!: (reason?: unknown) => void
    const refresh = new Promise<FetchPhotosResult>((_resolve, reject) => {
      rejectRefresh = reject
    })
    vi.mocked(fetchPhotos).mockReturnValue(refresh)

    const store = useGalleryStore()
    await store.fetchPhotos()
    await store.loadMore()
    expect(fetchPhotos).toHaveBeenCalledTimes(1)
    expect(store.photos).toEqual(cachedPhotos)

    rejectRefresh(new Error('refresh failed'))
    await vi.waitFor(() => expect(store.loading).toBe(false))
  })
  it('ignores an in-flight page response after a network refresh replaces the list', async () => {
    setCache('gallery-photos', { photos: mockPhotos, total: 10 })
    let resolveNextPage!: (value: FetchPhotosResult) => void
    const nextPage = new Promise<FetchPhotosResult>((resolve) => {
      resolveNextPage = resolve
    })
    vi.mocked(fetchPhotos)
      .mockReturnValueOnce(nextPage)
      .mockResolvedValueOnce({ photos: [mockPage2[0]!], total: 1 })

    const store = useGalleryStore()
    await store.fetchPhotos()
    const loadMore = store.loadMore()
    await store.fetchPhotos(true)
    resolveNextPage({ photos: mockPage2, total: 10 })
    await loadMore

    expect(vi.mocked(fetchPhotos)).toHaveBeenNthCalledWith(1, 1, 9)
    expect(vi.mocked(fetchPhotos)).toHaveBeenNthCalledWith(2, 0, 9)
    expect(store.photos).toEqual([mockPage2[0]])
  })

  it('loadMore always calls the API and does not cache', async () => {
    setCache('gallery-photos', { photos: mockPhotos, total: 2 })
    vi.mocked(fetchPhotos).mockResolvedValue({ photos: mockPage2, total: 2 })

    const store = useGalleryStore()
    await store.loadMore()

    expect(vi.mocked(fetchPhotos)).toHaveBeenCalledTimes(1)
  })
})
