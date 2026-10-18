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
  localStorage.clear()
  frameCallbacks = []
  transitionStyle = document.createElement('style')
  transitionStyle.textContent = '.gallery-enter-active { transition: opacity 1s; }'
  document.head.append(transitionStyle)
  vi.clearAllMocks()
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

describe('Gallery layout', () => {
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
})
