import type { InteractionComment, InteractionConfig } from '@/types/interactions'

const DELIVERY_API = 'https://cdn.contentful.com'

interface ContentfulResponse {
  items?: unknown[]
  total?: unknown
}

export function mapCommentPageItems(
  items: unknown[],
  skip: number,
  total: number,
): { comments: InteractionComment[]; hasMoreComments: boolean } {
  return { comments: items.map(normalizeComment), hasMoreComments: skip + items.length < total }
}

function normalizeComment(value: unknown): InteractionComment {
  const entry = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const sys = entry.sys && typeof entry.sys === 'object' ? entry.sys as Record<string, unknown> : {}
  const fields = entry.fields && typeof entry.fields === 'object' ? entry.fields as Record<string, unknown> : {}
  const field = (name: string): string => {
    const candidate = fields[name]
    if (typeof candidate === 'string') return candidate
    if (candidate && typeof candidate === 'object') {
      const localized = (candidate as Record<string, unknown>)['en-US']
      if (typeof localized === 'string') return localized
    }
    return ''
  }
  return {
    id: typeof sys.id === 'string' ? sys.id : '',
    photoId: field('photoId'),
    ipHash: field('ipHash'),
    text: field('text').trim(),
    createdAt: field('createdAt'),
    status: field('status') === 'pending' ? 'pending' : 'visible',
  }
}

export async function fetchCommentPage(
  config: InteractionConfig,
  photoId: string,
  skip: number,
  limit: number,
): Promise<{ comments: InteractionComment[]; hasMoreComments: boolean }> {
  const url = new URL(`/spaces/${encodeURIComponent(config.space)}/environments/${encodeURIComponent(config.environment)}/entries`, DELIVERY_API)
  const query = {
    content_type: 'photoComment',
    'fields.photoId': photoId,
    'fields.status': 'visible',
    order: '-fields.createdAt',
    skip: String(skip),
    limit: String(limit),
  }
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
  const response = await fetch(url, { headers: { Authorization: `Bearer ${config.readAccessToken}` } })
  if (!response.ok) throw new Error('Could not load comments.')
  const result = await response.json() as ContentfulResponse
  const items = Array.isArray(result.items) ? result.items : []
  const total = typeof result.total === 'number' ? result.total : items.length
  return mapCommentPageItems(items, skip, total)
}
