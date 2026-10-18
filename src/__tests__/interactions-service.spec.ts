import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createComment,
  createLike,
  deleteLike,
  fetchInteractionSummary,
  fetchOlderComments,
} from '@/services/interactions'

const IP_HASH = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('interactions service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_CONTENTFUL_SPACE', 'gallery-space')
    vi.stubEnv('VITE_CONTENTFUL_ACCESS_TOKEN', 'gallery-token')
    vi.stubEnv('VITE_INTERACTION_SPACE', 'interaction-space')
    vi.stubEnv('VITE_INTERACTION_ENVIRONMENT', 'master')
    vi.stubEnv('VITE_INTERACTION_ACCESS_TOKEN', 'interaction-token')
    vi.stubEnv('VITE_IP_DISCOVERY_URL', 'https://example.test/ip')
  })

  it('fetches likes and five newest visible comments with pagination', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ items: [], total: 3 }))
      .mockResolvedValueOnce(jsonResponse({ items: [{ sys: { id: 'like-1' } }], total: 1 }))
      .mockResolvedValueOnce(jsonResponse({
        items: [
          {
            sys: { id: 'comment-1' },
            fields: {
              photoId: 'photo-1',
              ipHash: IP_HASH,
              text: '  hello  ',
              createdAt: '2026-08-29T12:00:00.000Z',
              status: 'visible',
            },
          },
        ],
        total: 6,
      }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchInteractionSummary('photo-1', IP_HASH)).resolves.toEqual({
      likeCount: 3,
      likedByViewer: true,
      viewerLikeId: 'like-1',
      comments: [{
        id: 'comment-1',
        photoId: 'photo-1',
        ipHash: IP_HASH,
        text: 'hello',
        createdAt: '2026-08-29T12:00:00.000Z',
        status: 'visible',
      }],
      hasMoreComments: true,
    })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    const calls = fetchMock.mock.calls
    expect(new Headers(calls[0]?.[1]?.headers).get('Authorization')).toBe('Bearer gallery-token')
    expect(new Headers(calls[1]?.[1]?.headers).get('Authorization')).toBe('Bearer gallery-token')
    expect(new Headers(calls[2]?.[1]?.headers).get('Authorization')).toBe('Bearer gallery-token')
    const likesQuery = new URL(String(calls[0]?.[0])).searchParams
    const viewerQuery = new URL(String(calls[1]?.[0])).searchParams
    const commentsQuery = new URL(String(calls[2]?.[0])).searchParams
    expect(likesQuery.get('content_type')).toBe('photoLike')
    expect(likesQuery.get('fields.photoId')).toBe('photo-1')
    expect(viewerQuery.get('fields.ipHash')).toBe(IP_HASH)
    expect(viewerQuery.get('fields.photoId')).toBe('photo-1')
    expect(commentsQuery.get('content_type')).toBe('photoComment')
    expect(commentsQuery.get('fields.status')).toBe('visible')
    expect(commentsQuery.get('order')).toBe('-fields.createdAt')
    expect(commentsQuery.get('limit')).toBe('5')
    expect(commentsQuery.get('skip')).toBe('0')
  })

  it('falls back to the gallery space and master environment', async () => {
    vi.stubEnv('VITE_INTERACTION_SPACE', '')
    vi.stubEnv('VITE_INTERACTION_ENVIRONMENT', '')
    vi.stubEnv('VITE_CONTENTFUL_SPACE', 'gallery-space')

    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ items: [], total: 0 }))
      .mockResolvedValueOnce(jsonResponse({ items: [], total: 0 }))
      .mockResolvedValueOnce(jsonResponse({ items: [], total: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    await fetchInteractionSummary('photo-1', IP_HASH)

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      '/spaces/gallery-space/environments/master/entries',
    )
  })

  it('requests only the next comment page without querying likes', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ items: [], total: 6 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchOlderComments('photo-1', 5)).resolves.toEqual({
      comments: [],
      hasMoreComments: true,
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const query = new URL(String(fetchMock.mock.calls[0]?.[0])).searchParams
    expect(query.get('content_type')).toBe('photoComment')
    expect(query.get('order')).toBe('-fields.createdAt')
    expect(query.get('skip')).toBe('5')
    expect(query.get('limit')).toBe('5')
    expect(query.has('fields.ipHash')).toBe(false)
  })
  it('maps localized page fields from the configured Contentful locale', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      items: [{
        sys: { id: 'comment-localized' },
        fields: {
          photoId: { 'fr-FR': 'photo-fr', 'en-US': 'photo-1' },
          ipHash: { 'fr-FR': 'empreinte', 'en-US': IP_HASH },
          text: { 'fr-FR': 'bonjour', 'en-US': '  hello  ' },
          createdAt: { 'fr-FR': '2026-01-01', 'en-US': '2026-08-29T12:00:00.000Z' },
          status: { 'fr-FR': 'pending', 'en-US': 'visible' },
        },
      }],
      total: 1,
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchOlderComments('photo-1', 0)).resolves.toEqual({
      comments: [{
        id: 'comment-localized',
        photoId: 'photo-1',
        ipHash: IP_HASH,
        text: 'hello',
        createdAt: '2026-08-29T12:00:00.000Z',
        status: 'visible',
      }],
      hasMoreComments: false,
    })
  })


  it('uses skip and limit for older comments', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ items: [], total: 0 }))
      .mockResolvedValueOnce(jsonResponse({ items: [], total: 0 }))
      .mockResolvedValueOnce(jsonResponse({ items: [], total: 7 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchInteractionSummary('photo-1', IP_HASH, 5, 5)).resolves.toMatchObject({
      likeCount: 0,
      likedByViewer: false,
      comments: [],
      hasMoreComments: true,
    })
    const commentsQuery = new URL(String(fetchMock.mock.calls[2]?.[0])).searchParams
    expect(commentsQuery.get('skip')).toBe('5')
    expect(commentsQuery.get('limit')).toBe('5')
  })

  it('creates and publishes a like through the interaction-space Management API', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'like-1', version: 1 } }, 201))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'like-1', version: 2, publishedVersion: 1 } }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createLike('photo-1', IP_HASH)).resolves.toBe('like-1')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [createUrl, createOptions] = fetchMock.mock.calls[0] ?? []
    expect(String(createUrl)).toContain('/spaces/interaction-space/environments/master/entries')
    expect(createOptions?.method).toBe('POST')
    expect(new Headers(createOptions?.headers).get('Authorization')).toBe('Bearer interaction-token')
    expect(new Headers(createOptions?.headers).get('X-Contentful-Content-Type')).toBe('photoLike')
    expect(JSON.parse(String(createOptions?.body)).fields.photoId['en-US']).toBe('photo-1')
    expect(JSON.parse(String(createOptions?.body)).fields.ipHash['en-US']).toBe(IP_HASH)

    const [publishUrl, publishOptions] = fetchMock.mock.calls[1] ?? []
    expect(String(publishUrl)).toContain('/entries/like-1/published')
    expect(publishOptions?.method).toBe('PUT')
    expect(new Headers(publishOptions?.headers).get('X-Contentful-Version')).toBe('1')
  })
  
  it('creates and publishes a trimmed visible comment before mapping the response', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({
        sys: { id: 'comment-1', version: 1 },
        fields: {
          photoId: { 'en-US': 'photo-1' },
          ipHash: { 'en-US': IP_HASH },
          text: { 'en-US': 'hello' },
          createdAt: { 'en-US': '2026-08-29T12:00:00.000Z' },
          status: { 'en-US': 'visible' },
        },
      }, 201))
      .mockResolvedValueOnce(jsonResponse({
        sys: { id: 'comment-1', version: 2, publishedVersion: 1 },
        fields: {
          photoId: { 'en-US': 'photo-1' },
          ipHash: { 'en-US': IP_HASH },
          text: { 'en-US': 'hello' },
          createdAt: { 'en-US': '2026-08-29T12:00:00.000Z' },
          status: { 'en-US': 'visible' },
        },
      }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createComment('photo-1', IP_HASH, '  hello  ')).resolves.toEqual({
      id: 'comment-1',
      photoId: 'photo-1',
      ipHash: IP_HASH,
      text: 'hello',
      createdAt: '2026-08-29T12:00:00.000Z',
      status: 'visible',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('POST')
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('X-Contentful-Content-Type')).toBe('photoComment')
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('/entries/comment-1/published')
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe('PUT')
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('X-Contentful-Version')).toBe('1')
  })
  it('uses submitted comment fallbacks and a Contentful system timestamp when fields are absent', async () => {
    const systemTimestamp = '2026-08-30T12:00:00.000Z'
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'comment-1', version: 1 } }, 201))
      .mockResolvedValueOnce(jsonResponse({
        sys: { id: 'comment-1', version: 2, publishedVersion: 1, createdAt: systemTimestamp },
      }))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'comment-2', version: 1 } }, 201))
      .mockResolvedValueOnce(jsonResponse({
        sys: { id: 'comment-2', version: 2, publishedVersion: 1 },
      }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createComment('photo-1', IP_HASH, '  hello  ')).resolves.toEqual({
      id: 'comment-1',
      photoId: 'photo-1',
      ipHash: IP_HASH,
      text: 'hello',
      createdAt: systemTimestamp,
      status: 'visible',
    })
    const systemTimestampPayload = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    expect(systemTimestampPayload.fields.createdAt['en-US']).not.toBe(systemTimestamp)

    const fallbackComment = await createComment('photo-2', IP_HASH, '  fallback text  ')
    const fallbackPayload = JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))
    expect(fallbackComment).toEqual({
      id: 'comment-2',
      photoId: 'photo-2',
      ipHash: IP_HASH,
      text: 'fallback text',
      createdAt: fallbackPayload.fields.createdAt['en-US'],
      status: 'visible',
    })
  })

  it('compensates a confirmed failed like publication so a retry leaves only the retry published', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'failed-like', version: 1 } }, 201))
      .mockResolvedValueOnce(jsonResponse({ message: 'publish rejected' }, 500))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'failed-like', version: 2 } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'retry-like', version: 1 } }, 201))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'retry-like', version: 2, publishedVersion: 1 } }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createLike('photo-1', IP_HASH)).rejects.toThrow(/status 500/)
    await expect(createLike('photo-1', IP_HASH)).resolves.toBe('retry-like')

    expect(fetchMock).toHaveBeenCalledTimes(6)
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain('/entries/failed-like')
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe('GET')
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe('DELETE')
    expect(new Headers(fetchMock.mock.calls[3]?.[1]?.headers).get('X-Contentful-Version')).toBe('2')
    expect(String(fetchMock.mock.calls[5]?.[0])).toContain('/entries/retry-like/published')
  })

  it('compensates a confirmed failed comment publication and permits retry', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'failed-comment', version: 1 } }, 201))
      .mockResolvedValueOnce(jsonResponse({ message: 'publish rejected' }, 500))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'failed-comment', version: 3 } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({
        sys: { id: 'retry-comment', version: 1 },
        fields: {
          photoId: { 'en-US': 'photo-1' },
          ipHash: { 'en-US': IP_HASH },
          text: { 'en-US': 'hello' },
          createdAt: { 'en-US': '2026-08-29T12:00:00.000Z' },
          status: { 'en-US': 'visible' },
        },
      }, 201))
      .mockResolvedValueOnce(jsonResponse({
        sys: { id: 'retry-comment', version: 2, publishedVersion: 1 },
        fields: {
          photoId: { 'en-US': 'photo-1' },
          ipHash: { 'en-US': IP_HASH },
          text: { 'en-US': 'hello' },
          createdAt: { 'en-US': '2026-08-29T12:00:00.000Z' },
          status: { 'en-US': 'visible' },
        },
      }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createComment('photo-1', IP_HASH, 'hello')).rejects.toThrow(/status 500/)
    await expect(createComment('photo-1', IP_HASH, 'hello')).resolves.toMatchObject({
      id: 'retry-comment',
      text: 'hello',
      status: 'visible',
    })

    expect(fetchMock).toHaveBeenCalledTimes(6)
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain('/entries/failed-comment')
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe('GET')
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe('DELETE')
    expect(new Headers(fetchMock.mock.calls[3]?.[1]?.headers).get('X-Contentful-Version')).toBe('3')
    expect(String(fetchMock.mock.calls[5]?.[0])).toContain('/entries/retry-comment/published')
  })

  it('inspects after a network failure and returns success when publication happened remotely', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'published-like', version: 1 } }, 201))
      .mockRejectedValueOnce(new TypeError('network timeout'))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'published-like', version: 2, publishedVersion: 1 } }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createLike('photo-1', IP_HASH)).resolves.toBe('published-like')
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe('GET')
    expect(String(fetchMock.mock.calls[2]?.[0])).toMatch(/\/entries\/published-like$/)
  })

  it('compensates a confirmed unpublished draft with its current version after a network failure', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'unpublished-like', version: 1 } }, 201))
      .mockRejectedValueOnce(new TypeError('network timeout'))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'unpublished-like', version: 4 } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createLike('photo-1', IP_HASH)).rejects.toThrow('network timeout')
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe('GET')
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe('DELETE')
    expect(new Headers(fetchMock.mock.calls[3]?.[1]?.headers).get('X-Contentful-Version')).toBe('4')
  })

  it('retains an interaction when publication and remote-state inspection are uncertain', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'uncertain-like', version: 1 } }, 201))
      .mockRejectedValueOnce(new TypeError('network timeout'))
      .mockRejectedValueOnce(new TypeError('inspection timeout'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createLike('photo-1', IP_HASH)).rejects.toThrow(/network timeout.*state could not be confirmed/i)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe('GET')
  })
  it('inspects a malformed publication response and returns success if the entry is published', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'malformed-like', version: 1 } }, 201))
      .mockResolvedValueOnce(new Response('not json', { status: 200 }))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'malformed-like', version: 2, publishedVersion: 1 } }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createLike('photo-1', IP_HASH)).resolves.toBe('malformed-like')
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe('GET')
  })

  it('reports when draft compensation itself fails after publication rejection', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'like-to-clean', version: 1 } }, 201))
      .mockResolvedValueOnce(jsonResponse({ message: 'publish rejected' }, 500))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'like-to-clean', version: 3 } }))
      .mockResolvedValueOnce(jsonResponse({ message: 'delete rejected' }, 500))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createLike('photo-1', IP_HASH)).rejects.toThrow(/Draft cleanup failed.*status 500/)
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe('GET')
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe('DELETE')
  })


  it('unpublishes a published like before deleting it with the current version', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'like-1', version: 7, publishedVersion: 6 } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'like-1', version: 8 } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(deleteLike('like-1')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('/entries/like-1/published')
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe('DELETE')
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('X-Contentful-Version')).toBe('7')
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe('GET')
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe('DELETE')
    expect(new Headers(fetchMock.mock.calls[3]?.[1]?.headers).get('X-Contentful-Version')).toBe('8')
  })

  it('creates a like through the interaction-space Management API', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'like-1', version: 1 } }, 201))
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'like-1', version: 2 } }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createLike('photo-1', IP_HASH)).resolves.toBe('like-1')
    const [url, options] = fetchMock.mock.calls[0] ?? []
    expect(String(url)).toContain('/spaces/interaction-space/environments/master/entries')
    expect(options?.method).toBe('POST')
    expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer interaction-token')
    expect(new Headers(options?.headers).get('X-Contentful-Content-Type')).toBe('photoLike')
    expect(JSON.parse(String(options?.body)).fields.photoId['en-US']).toBe('photo-1')
    expect(JSON.parse(String(options?.body)).fields.ipHash['en-US']).toBe(IP_HASH)
  })



  it('uses the entry version returned by Management API before deleting a like', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ sys: { id: 'like-1', version: 7 } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(deleteLike('like-1')).resolves.toBeUndefined()
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('GET')
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe('DELETE')
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('X-Contentful-Version')).toBe('7')
  })

  it('rejects invalid values before making a request', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)

    await expect(createLike('', IP_HASH)).rejects.toThrow(/photoId/i)
    await expect(createComment('photo-1', IP_HASH, ' '.repeat(2))).rejects.toThrow(/comment/i)
    await expect(createComment('photo-1', IP_HASH, 'x'.repeat(501))).rejects.toThrow(/500/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
