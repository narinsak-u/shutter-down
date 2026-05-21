import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetEntries = vi.fn()

vi.mock('contentful', () => ({
  createClient: vi.fn(() => ({
    withoutUnresolvableLinks: { getEntries: mockGetEntries },
  })),
}))

const { fetchPhotos } = await import('@/services/contentful')

const mockEntry = (overrides: Record<string, unknown> = {}) => ({
  sys: { id: 'entry-1' },
  fields: {
    location: 'Paris, FR',
    alt: 'A beautiful photo',
    date: 'Jan 2024',
    type: 'portrait',
    category: 'Architecture',
    image: {
      fields: {
        file: { url: '//images.ctfassets.net/abc/photo.jpg' },
      },
    },
    ...overrides,
  },
})

describe('contentful service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and maps gallery entries to Photo[]', async () => {
    mockGetEntries.mockResolvedValue({ items: [mockEntry()] })

    const photos = await fetchPhotos()

    expect(photos).toHaveLength(1)
    expect(photos[0]).toEqual({
      id: 'entry-1',
      src: 'https://images.ctfassets.net/abc/photo.jpg',
      alt: 'A beautiful photo',
      location: 'Paris, FR',
      date: 'Jan 2024',
      type: 'portrait',
      category: 'Architecture',
    })
  })

  it('uses correct content type', async () => {
    mockGetEntries.mockResolvedValue({ items: [] })

    await fetchPhotos()

    expect(mockGetEntries).toHaveBeenCalledWith({ content_type: 'gallery' })
  })

  it('handles missing image gracefully', async () => {
    mockGetEntries.mockResolvedValue({ items: [mockEntry({ image: undefined })] })

    const photos = await fetchPhotos()

    expect(photos[0]?.src).toBe('')
  })

  it('falls back type to square for invalid values', async () => {
    mockGetEntries.mockResolvedValue({ items: [mockEntry({ type: 'panorama' })] })

    const photos = await fetchPhotos()

    expect(photos[0]?.type).toBe('square')
  })

  it('throws when client fails', async () => {
    mockGetEntries.mockRejectedValue(new Error('API error'))

    await expect(fetchPhotos()).rejects.toThrow('API error')
  })
})
