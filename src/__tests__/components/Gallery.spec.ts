import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Gallery from '../../components/Gallery.vue'

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(function() {
  return {
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  }
})

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

describe('Gallery', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders all categories', () => {
    const wrapper = mount(Gallery)
    expect(wrapper.text()).toContain('Architecture')
    expect(wrapper.text()).toContain('Nature')
  })

  it('displays gallery items', () => {
    const wrapper = mount(Gallery)
    const items = wrapper.findAll('.masonry-item')
    expect(items.length).toBeGreaterThan(0)
  })
})
