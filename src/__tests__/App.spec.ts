import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
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
  it('mounts renders properly', () => {
    const pinia = createPinia()
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.text()).toContain('A study in contrast and light.')
  })
})
