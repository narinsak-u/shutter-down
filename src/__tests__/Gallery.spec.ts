import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import type { Photo } from '@/types/gallery'
import { fetchPhotos } from '@/services/contentful'
import { useGalleryStore } from '@/stores/gallery'
import Gallery from '@/components/Gallery.vue'

vi.mock('@/services/contentful', () => ({
  fetchPhotos: vi.fn<(skip: number, limit: number) => Promise<{ photos: Photo[]; total: number }>>(),
}))

const photo = (id: string): Photo => ({
  id,
  thumbSrc: `https://images.example/${id}?w=600`,
  src: `https://images.example/${id}`,
  imageWidth: 800,
  imageHeight: 600,
  alt: `Photo ${id}`,
  location: 'Paris',
  date: '2026-01-01',
  type: 'landscape',
  category: 'Nature',
})

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

const localStorageData = new Map<string, string>()
let wrapper: VueWrapper | undefined
let frameCallbacks: FrameRequestCallback[]
let transitionStyle: HTMLStyleElement | undefined
let originalInnerWidth: number

class TestObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  originalInnerWidth = window.innerWidth
  setActivePinia(createPinia())
  localStorageData.clear()
  frameCallbacks = []
  transitionStyle = document.createElement('style')
  transitionStyle.textContent = '.gallery-enter-active { transition: opacity 1s; }'
  document.head.append(transitionStyle)
  vi.clearAllMocks()
  vi.stubGlobal('localStorage', {
    clear: () => localStorageData.clear(),
    getItem: (key: string) => localStorageData.get(key) ?? null,
    setItem: (key: string, value: string) => localStorageData.set(key, String(value)),
    removeItem: (key: string) => localStorageData.delete(key),
  })
  vi.stubGlobal('IntersectionObserver', TestObserver)
  vi.stubGlobal('ResizeObserver', TestObserver)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frameCallbacks.push(callback)
    return frameCallbacks.length
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn<(handle: number) => void>())
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.unstubAllGlobals()
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth })
  transitionStyle?.remove()
  transitionStyle = undefined
})

describe('Gallery', () => {
  it('presents a clear page heading and exposes the selected category', async () => {
    vi.mocked(fetchPhotos).mockResolvedValueOnce({
      photos: [photo('nature'), { ...photo('building'), category: 'Architecture' }],
      total: 2,
    })
    wrapper = mount(Gallery)
    await flushPromises()

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('h1').text()).toBe('Eyes up, shutter down.')
    expect(wrapper.find('h2').exists()).toBe(false)

    const natureFilter = wrapper.get('nav').findAll('button').find((button) => button.text() === 'Nature')
    expect(natureFilter?.attributes('aria-pressed')).toBe('false')
    await natureFilter?.trigger('click')

    expect(natureFilter?.attributes('aria-pressed')).toBe('true')
    expect(wrapper.findAll('button[aria-pressed="true"]')).toHaveLength(1)
    expect(wrapper.findAll('button[aria-pressed="false"]')).toHaveLength(3)
    expect(wrapper.findAll('img')).toHaveLength(1)
    expect(wrapper.get('img').attributes('alt')).toBe('Photo nature')
  })

  it('opens the focused Photo with keyboard activation in the lightbox', async () => {
    vi.mocked(fetchPhotos).mockResolvedValueOnce({
      photos: [photo('first'), { ...photo('second'), category: 'Architecture' }],
      total: 2,
    })
    wrapper = mount(Gallery)
    await flushPromises()

    const photoControl = wrapper.get('button[aria-label="Photo second"]')
    expect(photoControl.element.tagName).toBe('BUTTON')
    expect(photoControl.attributes('type')).toBe('button')
    await photoControl.trigger('keydown.enter')

    const galleryStore = useGalleryStore()
    expect(galleryStore.lightboxOpen).toBe(true)
    expect(galleryStore.lightboxIndex).toBe(1)
  })

  it('assigns every card width before reading heights and positions cards by shortest column', async () => {
    vi.mocked(fetchPhotos).mockResolvedValueOnce({
      photos: [photo('one'), photo('two'), photo('three'), photo('four'), photo('five')],
      total: 5,
    })
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 })
    wrapper = mount(Gallery, { attachTo: document.body, global: { stubs: { TransitionGroup: false } } })
    await flushPromises()
    await nextTick()

    const grid = wrapper.get('#gallery').element as HTMLElement
    Object.defineProperty(grid, 'clientWidth', { configurable: true, value: 1000 })
    const cards = [...wrapper.findAll('.gallery-item')]
    const heights = [100, 180, 120, 80, 60]
    const reads: HTMLElement[] = []
    cards.forEach((card, index) => {
      const element = card.element as HTMLElement
      Object.defineProperty(element, 'offsetHeight', {
        configurable: true,
        get() {
          expect(cards.every((candidate) => (candidate.element as HTMLElement).style.width !== '')).toBe(true)
          expect(cards.every((candidate) => (candidate.element as HTMLElement).style.left === '')).toBe(true)
          expect(cards.every((candidate) => (candidate.element as HTMLElement).style.top === '')).toBe(true)
          reads.push(element)
          return heights[index] ?? 0
        },
      })
    })

    frameCallbacks.splice(0).forEach((callback) => callback(0))
    await nextTick()

    expect(reads).toHaveLength(5)
    expect(cards.map((card) => [
      (card.element as HTMLElement).style.left,
      (card.element as HTMLElement).style.top,
    ])).toEqual([
      ['0px', '0px'],
      ['256px', '0px'],
      ['512px', '0px'],
      ['768px', '0px'],
      ['768px', '104px'],
    ])
  })

  it('does not reveal appended Photos before their masonry positions are assigned', async () => {
    vi.mocked(fetchPhotos)
      .mockResolvedValueOnce({ photos: [photo('first')], total: 2 })
      .mockResolvedValueOnce({ photos: [photo('second')], total: 2 })
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    wrapper = mount(Gallery, { attachTo: document.body, global: { stubs: { TransitionGroup: false } } })
    await flushPromises()
    await nextTick()

    const grid = wrapper.get('#gallery').element as HTMLElement
    Object.defineProperty(grid, 'clientWidth', { configurable: true, value: 342 })
    const initialFrames = frameCallbacks.splice(0)
    initialFrames.forEach((callback) => callback(0))
    await nextTick()

    await useGalleryStore().loadMore()
    await flushPromises()
    await nextTick()
    const appendedPhoto = wrapper.get('[data-photo-id="second"]')
    expect((appendedPhoto.element as HTMLElement).style.visibility).toBe('hidden')
    expect((appendedPhoto.element as HTMLElement).style.top).toBe('')

    const layoutFrames = frameCallbacks.splice(0)
    layoutFrames.forEach((callback) => callback(0))
    await nextTick()
    expect((appendedPhoto.element as HTMLElement).style.top).toBe('24px')
    expect((appendedPhoto.element as HTMLElement).style.visibility).toBe('')
  })

  it('keeps stale Photos visible while a background refresh is unresolved', async () => {
    localStorage.setItem(
      'cache:gallery-photos',
      JSON.stringify({
        timestamp: Date.now() - 900_001,
        data: { photos: [photo('stale')], total: 1 },
      }),
    )
    const refresh = deferred<{ photos: Photo[]; total: number }>()
    vi.mocked(fetchPhotos).mockReturnValue(refresh.promise)

    wrapper = mount(Gallery, { global: { stubs: { TransitionGroup: false } } })
    await nextTick()

    expect(wrapper.find('[data-photo-id="stale"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Loading...')

    refresh.reject(new Error('Refresh failed'))
    await flushPromises()

    expect(wrapper.find('[data-photo-id="stale"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Refresh failed')
    const retry = wrapper.findAll('button').find((button) => button.text() === 'Retry')
    expect(retry?.text()).toBe('Retry')

    vi.mocked(fetchPhotos).mockResolvedValueOnce({ photos: [photo('fresh')], total: 1 })
    await retry?.trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-photo-id="fresh"]').exists()).toBe(true)
  })

  it('shows Loading and a full-screen retryable error when no cached Photos exist', async () => {
    const request = deferred<{ photos: Photo[]; total: number }>()
    vi.mocked(fetchPhotos).mockReturnValue(request.promise)

    wrapper = mount(Gallery)
    await nextTick()
    expect(wrapper.text()).toContain('Loading...')

    request.reject(new Error('Initial load failed'))
    await flushPromises()

    expect(wrapper.text()).toContain('Initial load failed')
    expect(wrapper.findAll('button').find((button) => button.text() === 'Retry')?.text()).toBe('Retry')
    expect(wrapper.find('#gallery').exists()).toBe(false)
  })
})
