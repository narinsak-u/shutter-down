/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GalleryItem from '../components/GalleryItem.vue'

describe('GalleryItem', () => {
  const baseProps = {
    src: 'https://example.com/photo.jpg',
    thumbSrc: 'https://example.com/photo.jpg?w=600&fit=thumb&fm=webp',
    alt: 'A test photo',
    location: 'Paris, FR',
    date: 'May, 2026',
    imageWidth: 1200,
    imageHeight: 800,
  }

  it('reserves the source image aspect ratio before the thumbnail loads', () => {
    const wrapper = mount(GalleryItem, { props: baseProps })
    const img = wrapper.find('img')
    expect(img.attributes('width')).toBe('1200')
    expect(img.attributes('height')).toBe('800')
  })
  it('prioritizes initially visible Photos while keeping below-fold Photos lazy', () => {
    const visible = mount(GalleryItem, { props: { ...baseProps, prioritize: true } }).find('img')
    const belowFold = mount(GalleryItem, { props: { ...baseProps, prioritize: false } }).find('img')

    expect(visible.attributes('loading')).toBe('eager')
    expect(visible.attributes('fetchpriority')).toBe('high')
    expect(belowFold.attributes('loading')).toBe('lazy')
    expect(belowFold.attributes('fetchpriority')).toBeUndefined()
  })

  it('renders without reserved dimensions when metadata is unavailable', () => {
    const wrapper = mount(GalleryItem, {
      props: { ...baseProps, imageWidth: undefined, imageHeight: undefined },
    })
    expect(wrapper.find('img').attributes('width')).toBeUndefined()
  })

  it('renders the thumbSrc as image src', () => {
    const wrapper = mount(GalleryItem as any, { props: baseProps })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe(baseProps.thumbSrc)
  })

  it('renders location and date text', () => {
    const wrapper = mount(GalleryItem as any, { props: baseProps })
    expect(wrapper.text()).toContain('Paris, FR')
    expect(wrapper.text()).toContain('May, 2026')
  })

})
