/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Lightbox from '../components/Lightbox.vue'

interface LightboxItem {
  src: string
  alt?: string
}

const items: LightboxItem[] = [
  { src: '/img1.jpg', alt: 'Photo 1' },
  { src: '/img2.jpg', alt: 'Photo 2' },
  { src: '/img3.jpg', alt: 'Photo 3' },
]

const single: LightboxItem[] = [{ src: '/img.jpg' }]

describe('Lightbox', () => {
  it('renders the current item image based on index', () => {
    const wrapper = mount(Lightbox as any, {
      props: { items, modelValue: true, index: 1 },
    })
    expect(wrapper.find('img').attributes('src')).toBe('/img2.jpg')
  })

  it('falls back to default alt when item has no alt', () => {
    const wrapper = mount(Lightbox as any, {
      props: { items: [{ src: '/img.jpg' }], modelValue: true, index: 0 },
    })
    expect(wrapper.find('img').attributes('alt')).toBe('Expanded gallery image')
  })

  it('emits update:index on next button click', () => {
    const wrapper = mount(Lightbox as any, {
      props: { items, modelValue: true, index: 0 },
    })
    wrapper.find('[aria-label="Next image"]').trigger('click')
    expect(wrapper.emitted('update:index')?.[0]?.[0]).toBe(1)
  })

  it('emits update:index on prev button click', () => {
    const wrapper = mount(Lightbox as any, {
      props: { items, modelValue: true, index: 1 },
    })
    wrapper.find('[aria-label="Previous image"]').trigger('click')
    expect(wrapper.emitted('update:index')?.[0]?.[0]).toBe(0)
  })

  it('wraps index on next past the last item', () => {
    const wrapper = mount(Lightbox as any, {
      props: { items, modelValue: true, index: 2 },
    })
    wrapper.find('[aria-label="Next image"]').trigger('click')
    expect(wrapper.emitted('update:index')?.[0]?.[0]).toBe(0)
  })

  it('wraps index on prev before the first item', () => {
    const wrapper = mount(Lightbox as any, {
      props: { items, modelValue: true, index: 0 },
    })
    wrapper.find('[aria-label="Previous image"]').trigger('click')
    expect(wrapper.emitted('update:index')?.[0]?.[0]).toBe(2)
  })

  it('hides nav buttons when only one item', () => {
    const wrapper = mount(Lightbox as any, {
      props: { items: single, modelValue: true, index: 0 },
    })
    expect(wrapper.find('[aria-label="Next image"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Previous image"]').exists()).toBe(false)
  })

  it('emits update:modelValue false on close button', () => {
    const wrapper = mount(Lightbox as any, {
      props: { items: single, modelValue: true, index: 0 },
    })
    wrapper.find('[aria-label="Close lightbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(false)
  })

  it('is visible only when modelValue is true', () => {
    const wrapper = mount(Lightbox as any, {
      props: { items: single, modelValue: false, index: 0 },
    })
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('closes on Escape key', async () => {
    const wrapper = mount(Lightbox as any, {
      props: { items, modelValue: false, index: 0 },
    })
    await wrapper.setProps({ modelValue: true } as any)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(false)
  })

  it('navigates to next on ArrowRight key', async () => {
    const wrapper = mount(Lightbox as any, {
      props: { items, modelValue: false, index: 0 },
    })
    await wrapper.setProps({ modelValue: true } as any)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(wrapper.emitted('update:index')?.[0]?.[0]).toBe(1)
  })

  it('navigates to prev on ArrowLeft key', async () => {
    const wrapper = mount(Lightbox as any, {
      props: { items, modelValue: false, index: 1 },
    })
    await wrapper.setProps({ modelValue: true } as any)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(wrapper.emitted('update:index')?.[0]?.[0]).toBe(0)
  })

  it('locks body scroll when open', async () => {
    const wrapper = mount(Lightbox as any, {
      props: { items: single, modelValue: false, index: 0 },
    })
    await wrapper.setProps({ modelValue: true } as any)
    expect(document.body.style.overflow).toBe('hidden')
  })
})
