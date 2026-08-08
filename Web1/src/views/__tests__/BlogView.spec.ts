import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../router'
import BlogView from '../BlogView.vue'
import type { WordPressPost } from '../../types/api'

vi.mock('../../services/dataService')

import { fetchBlogPosts } from '../../services/dataService'

const globalStubs = {
  directives: { 'animate-on-scroll': {}, spotlight: {}, ripple: {} },
  plugins: [router],
}

function makePost(id: number, slug: string, title: string): WordPressPost {
  return {
    id,
    date: '2026-01-01T00:00:00',
    date_gmt: '2026-01-01T00:00:00',
    guid: { rendered: `http://example.com/?p=${id}` },
    modified: '2026-01-01T00:00:00',
    modified_gmt: '2026-01-01T00:00:00',
    slug,
    status: 'publish',
    type: 'post',
    link: `http://example.com/blog/${slug}`,
    title: { rendered: title },
    content: { rendered: '<p>Contenido del artículo</p>' },
    excerpt: { rendered: '<p>Extracto del artículo</p>' },
    author: 1,
    featured_media: 0,
    comment_status: 'closed',
    ping_status: 'closed',
    sticky: false,
    template: '',
    format: 'standard',
    _embedded: {
      'wp:featuredmedia': [{ source_url: 'http://example.com/img.jpg', alt_text: title }],
      'wp:term': [[{ id: 1, name: 'Ansiedad', slug: 'ansiedad', taxonomy: 'category' }]],
    },
  }
}

describe('BlogView', () => {
  it('renders a card for each post once loaded', async () => {
    vi.mocked(fetchBlogPosts).mockResolvedValue({
      posts: [
        makePost(1, 'primer-articulo', 'Primer artículo'),
        makePost(2, 'segundo-articulo', 'Segundo artículo'),
      ],
      totalPages: 1,
    })

    await router.push('/blog')
    await router.isReady()
    const wrapper = mount(BlogView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Primer artículo')
    expect(wrapper.text()).toContain('Segundo artículo')
    expect(wrapper.findAllComponents({ name: 'BlogCard' })).toHaveLength(2)
  })

  it('shows an empty state when there are no posts', async () => {
    vi.mocked(fetchBlogPosts).mockResolvedValue({ posts: [], totalPages: 1 })

    await router.push('/blog')
    await router.isReady()
    const wrapper = mount(BlogView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Todavía no hay artículos publicados')
  })

  it('shows an error message when the fetch fails', async () => {
    vi.mocked(fetchBlogPosts).mockRejectedValue(new Error('boom'))

    await router.push('/blog')
    await router.isReady()
    const wrapper = mount(BlogView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('boom')
  })

  it('does not show pagination controls when there is only one page', async () => {
    vi.mocked(fetchBlogPosts).mockResolvedValue({
      posts: [makePost(1, 'primer-articulo', 'Primer artículo')],
      totalPages: 1,
    })

    await router.push('/blog')
    await router.isReady()
    const wrapper = mount(BlogView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.kb-blog__pagination').exists()).toBe(false)
  })

  it('requests the next page and disables the boundary buttons', async () => {
    vi.mocked(fetchBlogPosts).mockResolvedValue({
      posts: [makePost(1, 'primer-articulo', 'Primer artículo')],
      totalPages: 3,
    })

    await router.push('/blog')
    await router.isReady()
    const wrapper = mount(BlogView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    const [prevButton, nextButton] = wrapper.findAll('.kb-blog__page-btn')
    expect(prevButton?.attributes('disabled')).toBeDefined()
    expect(nextButton?.attributes('disabled')).toBeUndefined()

    await nextButton?.trigger('click')
    await flushPromises()

    expect(fetchBlogPosts).toHaveBeenLastCalledWith(2)
    expect(wrapper.text()).toContain('Página 2 de 3')
  })
})
