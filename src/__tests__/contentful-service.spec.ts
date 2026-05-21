import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetEntries = vi.fn<(query?: unknown) => Promise<{ items: unknown[] }>>()

vi.mock('contentful', () => ({
  createClient: vi.fn<(config?: unknown) => unknown>(() => ({
    getEntries: mockGetEntries,
  })),
}))

const { fetchPhotos } = await import('@/services/contentful')

const makeRichText = (text: string) => ({
  data: {},
  content: [
    {
      data: {},
      content: [
        {
          data: {},
          marks: [],
          value: text,
          nodeType: 'text',
        },
      ],
      nodeType: 'paragraph',
    },
  ],
  nodeType: 'document',
})

const mockEntry = (overrides: Record<string, unknown> = {}) => ({
  sys: { id: 'entry-1' },
  fields: {
    location: 'Paris, FR',
    alt: makeRichText('A beautiful photo'),
    date: 'Jan 2024',
    type: 'portrait',
    category: 'Architecture',
    src: {
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
    mockGetEntries.mockResolvedValue({ items: [mockEntry({ src: undefined })] })

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
