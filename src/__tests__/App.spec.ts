import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '../App.vue'

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

describe('App', () => {
  it('renders properly and shows brand', () => {
    setActivePinia(createPinia())
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('LUMINA')
  })
})
