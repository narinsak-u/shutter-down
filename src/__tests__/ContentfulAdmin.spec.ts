import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import type { PageAppSDK } from '@contentful/app-sdk'
import ContentfulAdmin from '@/components/ContentfulAdmin.vue'

const asset = (id: string) => ({
  sys: { id, publishedVersion: 1 },
  fields: { file: { 'en-US': { url: `//images.example/${id}`, details: { image: { width: 800, height: 600 } } } } },
})

const entry = (id: string, assetId: string) => ({
  sys: { id, publishedVersion: 1, version: 2 },
  fields: {
    location: { 'en-US': 'Existing location' },
    date: { 'en-US': '2026-01-01' },
    type: { 'en-US': 'landscape' },
    category: { 'en-US': 'Nature' },
    alt: { 'en-US': { nodeType: 'document', content: [{ nodeType: 'paragraph', content: [{ value: 'Existing alt' }] }] } },
    src: { 'en-US': { sys: { id: assetId, linkType: 'Asset' } } },
    likes: { 'en-US': 4 },
    comments: { 'en-US': [] },
  },
})

function sdkFor(overrides: Record<string, unknown> = {}) {
  const calls: string[] = []
  const newAsset = asset('new-asset')
  const existingEntry = entry('photo-1', 'old-asset')
  const sdk = {
    locales: { default: 'en-US' },
    dialogs: { openConfirm: vi.fn().mockResolvedValue(true) },
    notifier: { success: vi.fn() },
    cma: {
      upload: { create: vi.fn().mockResolvedValue({ sys: { id: 'upload-1' } }), delete: vi.fn() },
      asset: {
        create: vi.fn().mockResolvedValue(newAsset),
        processForLocale: vi.fn().mockResolvedValue(newAsset),
        publish: vi.fn().mockResolvedValue(newAsset),
        get: vi.fn().mockImplementation(async ({ assetId }) => asset(assetId)),
        unpublish: vi.fn().mockImplementation(async ({ assetId }) => { calls.push(`unpublish:${assetId}`) }),
        delete: vi.fn().mockImplementation(async ({ assetId }) => { calls.push(`delete:${assetId}`) }),
      },
      entry: {
        getPublished: vi.fn().mockImplementation(async (params) => params.query
          ? { items: [existingEntry], includes: { Asset: [asset('old-asset')] } }
          : existingEntry),
        get: vi.fn().mockResolvedValue(existingEntry),
        create: vi.fn().mockResolvedValue({ ...entry('draft-1', 'new-asset'), sys: { id: 'draft-1', version: 1 } }),
        publish: vi.fn().mockImplementation(async (_params, value) => { calls.push(`publish:${value.sys.id}`); return value }),
        update: vi.fn().mockImplementation(async (_params, value) => ({ ...value, sys: { ...value.sys, version: 3 } })),
        delete: vi.fn().mockImplementation(async ({ entryId }) => { calls.push(`delete-entry:${entryId}`) }),
      },
    },
    ...overrides,
  }
  return { sdk: sdk as unknown as PageAppSDK, calls, newAsset, existingEntry }
}


async function selectImage(wrapper: VueWrapper) {
  const file = new File(['image bytes'], 'replacement.jpg', { type: 'image/jpeg' })
  const dropTarget = wrapper.findAll('button').find((button) =>
    button.text().includes('Drag and drop') || button.text().includes('Drop a replacement'),
  )
  if (!dropTarget) throw new Error('Image drop target missing')
  await dropTarget.trigger('drop', { dataTransfer: { files: [file] } })
}

async function enterRequiredFields(wrapper: VueWrapper, prefix: 'contentful-photo' | 'edit-photo') {
  await wrapper.get(`#${prefix}-location`).setValue('Edited location')
  await wrapper.get(`#${prefix}-date`).setValue('2026-02-02')
  await wrapper.get(`#${prefix}-category`).setValue('Nature')
  await wrapper.get(`#${prefix}-alt`).setValue('New description')
}

describe('Contentful Admin recovery', () => {
  it('removes a failed new Photo draft before deleting its unreferenced asset', async () => {
    const setup = sdkFor()
    vi.mocked(setup.sdk.cma.entry.publish).mockRejectedValueOnce(new Error('publish failed'))
    const wrapper = mount(ContentfulAdmin, { props: { sdk: setup.sdk } })
    vi.mocked(setup.sdk.cma.entry.get).mockResolvedValueOnce({
      ...entry('draft-1', 'new-asset'),
      sys: { id: 'draft-1', version: 2 },
    } as never)
    await selectImage(wrapper)
    await enterRequiredFields(wrapper, 'contentful-photo')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(setup.sdk.cma.entry.delete).toHaveBeenCalledWith({ entryId: 'draft-1' })
    expect(setup.calls.indexOf('delete-entry:draft-1')).toBeLessThan(setup.calls.indexOf('delete:new-asset'))
    expect(wrapper.get('[role="alert"]').text()).toContain('publish failed')
    wrapper.unmount()
  })

  it('keeps the published Photo and old asset when replacement publication fails', async () => {
    const setup = sdkFor()
    vi.mocked(setup.sdk.cma.entry.publish).mockRejectedValueOnce(new Error('replacement failed'))
    const wrapper = mount(ContentfulAdmin, { props: { sdk: setup.sdk } })
    await wrapper.get('nav button:nth-child(2)').trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text().includes('Existing location'))!.trigger('click')
    await flushPromises()
    await selectImage(wrapper)
    await enterRequiredFields(wrapper, 'edit-photo')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(setup.sdk.cma.entry.publish).toHaveBeenCalledTimes(1)
    expect(setup.sdk.cma.entry.update).toHaveBeenCalledTimes(2)
    expect(setup.calls).not.toContain('unpublish:old-asset')
    expect(setup.calls).not.toContain('delete:old-asset')
    expect(setup.calls).toContain('delete:new-asset')
    expect(wrapper.get('[role="alert"]').text()).toContain('replacement failed')
    wrapper.unmount()
  })
  it('retains the replacement asset when publish succeeds remotely but its response rejects', async () => {
    const setup = sdkFor()
    vi.mocked(setup.sdk.cma.entry.publish).mockImplementationOnce(async (_params, value) => {
      setup.calls.push(`publish:${value.sys.id}`)
      throw new Error('response lost after publication')
    })
    const wrapper = mount(ContentfulAdmin, { props: { sdk: setup.sdk } })
    await wrapper.get('nav button:nth-child(2)').trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text().includes('Existing location'))!.trigger('click')
    await flushPromises()
    await selectImage(wrapper)
    await enterRequiredFields(wrapper, 'edit-photo')
    vi.mocked(setup.sdk.cma.entry.getPublished).mockResolvedValue({
      items: [entry('photo-1', 'new-asset')],
    } as never)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(setup.sdk.cma.entry.getPublished).toHaveBeenCalledWith({
      query: { 'sys.id': 'photo-1', limit: 1 },
    })
    expect(setup.calls).not.toContain('delete:new-asset')
    expect(setup.calls).not.toContain('unpublish:new-asset')
    expect(wrapper.get('[role="alert"]').text()).toContain('response lost after publication')
    wrapper.unmount()
  })
  it('publishes the replacement Photo before removing its former asset', async () => {
    const setup = sdkFor()
    const wrapper = mount(ContentfulAdmin, { props: { sdk: setup.sdk } })
    await wrapper.get('nav button:nth-child(2)').trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text().includes('Existing location'))!.trigger('click')
    await flushPromises()
    await selectImage(wrapper)
    await enterRequiredFields(wrapper, 'edit-photo')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(setup.calls.indexOf('publish:photo-1')).toBeLessThan(setup.calls.indexOf('unpublish:old-asset'))
    expect(setup.calls).toContain('delete:old-asset')
    expect(wrapper.get('[role="status"]').text()).toContain('Photo saved successfully')
    wrapper.unmount()
  })
  it.each([
    ['upload creation', 'upload'],
    ['asset creation', 'create'],
    ['asset processing', 'processForLocale'],
    ['asset publication', 'publish'],
  ])('cleans incomplete upload work when %s fails', async (_label, failurePoint) => {
    const setup = sdkFor()
    if (failurePoint === 'upload') {
      vi.mocked(setup.sdk.cma.upload.create).mockRejectedValueOnce(new Error('image stage failed'))
    } else if (failurePoint === 'create') {
      vi.mocked(setup.sdk.cma.asset.create).mockRejectedValueOnce(new Error('image stage failed'))
    } else if (failurePoint === 'processForLocale') {
      vi.mocked(setup.sdk.cma.asset.processForLocale).mockRejectedValueOnce(new Error('image stage failed'))
    } else {
      vi.mocked(setup.sdk.cma.asset.publish).mockRejectedValueOnce(new Error('image stage failed'))
    }
    const wrapper = mount(ContentfulAdmin, { props: { sdk: setup.sdk } })
    await selectImage(wrapper)
    await enterRequiredFields(wrapper, 'contentful-photo')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(setup.sdk.cma.entry.create).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toContain('image stage failed')
    if (failurePoint === 'upload') expect(setup.sdk.cma.upload.delete).not.toHaveBeenCalled()
    if (failurePoint === 'create') expect(setup.sdk.cma.upload.delete).toHaveBeenCalledWith({ uploadId: 'upload-1' })
    if (failurePoint === 'processForLocale' || failurePoint === 'publish') {
      expect(setup.calls).toContain('delete:new-asset')
    }
    wrapper.unmount()
  })

  it('cleans the published image when a new Photo draft cannot be created', async () => {
    const setup = sdkFor()
    vi.mocked(setup.sdk.cma.entry.create).mockRejectedValueOnce(new Error('draft creation failed'))
    const wrapper = mount(ContentfulAdmin, { props: { sdk: setup.sdk } })
    await selectImage(wrapper)
    await enterRequiredFields(wrapper, 'contentful-photo')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(setup.calls).toContain('delete:new-asset')
    expect(wrapper.get('[role="alert"]').text()).toContain('draft creation failed')
    wrapper.unmount()
  })

  it('restores the existing Photo draft and keeps its old asset if update fails', async () => {
    const setup = sdkFor()
    vi.mocked(setup.sdk.cma.entry.update).mockRejectedValueOnce(new Error('entry update failed'))
    const wrapper = mount(ContentfulAdmin, { props: { sdk: setup.sdk } })
    await wrapper.get('nav button:nth-child(2)').trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text().includes('Existing location'))!.trigger('click')
    await flushPromises()
    await selectImage(wrapper)
    await enterRequiredFields(wrapper, 'edit-photo')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(setup.sdk.cma.entry.update).toHaveBeenCalledTimes(2)
    expect(setup.sdk.cma.entry.publish).not.toHaveBeenCalled()
    expect(setup.calls).toContain('delete:new-asset')
    expect(setup.calls).not.toContain('delete:old-asset')
    expect(wrapper.get('[role="alert"]').text()).toContain('entry update failed')
    wrapper.unmount()
  })
})
