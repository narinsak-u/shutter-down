import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '../App.vue'
import router from '../router'

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn<
  (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) => Record<string, unknown>
>(function () {
  return {
    root: null,
    rootMargin: "0px",
    thresholds: [0],
    disconnect: vi.fn<() => void>(),
    observe: vi.fn<() => void>(),
    takeRecords: vi.fn<() => void>(),
    unobserve: vi.fn<() => void>(),
  }
})

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

vi.mock('@/services/contentful', () => ({
  fetchPhotos: vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
}))

describe('App', () => {
  it('renders the gallery headline', async () => {
    setActivePinia(createPinia())
    await router.push('/')
    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Eyes up, shutter down.')
    expect(wrapper.text()).toContain('Built with')
  })
})
