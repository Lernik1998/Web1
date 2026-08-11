import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../router'
import BlogPostView from '../BlogPostView.vue'
import type { WordPressPost } from '../../types/api'

vi.mock('../../services/dataService')

import { fetchBlogPostBySlug } from '../../services/dataService'

const globalStubs = {
  directives: { 'animate-on-scroll': {}, spotlight: {}, ripple: {} },
  plugins: [router],
}

function makePost(): WordPressPost {
  return {
    id: 5,
    date: '2026-02-14T00:00:00',
    date_gmt: '2026-02-14T00:00:00',
    guid: { rendered: 'http://example.com/?p=5' },
    modified: '2026-02-14T00:00:00',
    modified_gmt: '2026-02-14T00:00:00',
    slug: 'algun-articulo',
    status: 'publish',
    type: 'post',
    link: 'http://example.com/blog/algun-articulo',
    title: { rendered: 'Algún artículo sobre bienestar' },
    content: { rendered: '<p>Cuerpo del artículo con contenido de interés.</p>' },
    excerpt: { rendered: '<p>Extracto</p>' },
    author: 1,
    featured_media: 0,
    comment_status: 'closed',
    ping_status: 'closed',
    sticky: false,
    template: '',
    format: 'standard',
    _embedded: {
      'wp:featuredmedia': [{ source_url: 'http://example.com/img.jpg', alt_text: 'Foto' }],
      'wp:term': [[{ id: 3, name: 'Bienestar', slug: 'bienestar', taxonomy: 'category' }]],
    },
  }
}

describe('BlogPostView', () => {
  it('fetches and renders the post matching the route slug', async () => {
    vi.mocked(fetchBlogPostBySlug).mockResolvedValue(makePost())

    await router.push('/blog/algun-articulo')
    await router.isReady()
    const wrapper = mount(BlogPostView, {
      props: { slug: 'algun-articulo' },
      global: globalStubs,
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(fetchBlogPostBySlug).toHaveBeenCalledWith('algun-articulo')
    expect(wrapper.text()).toContain('Algún artículo sobre bienestar')
    expect(wrapper.text()).toContain('Bienestar')
    expect(wrapper.text()).toContain('Cuerpo del artículo con contenido de interés.')
  })

  it('uses the first image inside the content as og:image when there is no featured image', async () => {
    const post = makePost()
    post._embedded = {
      'wp:term': [[{ id: 3, name: 'Bienestar', slug: 'bienestar', taxonomy: 'category' }]],
    }
    post.content.rendered =
      '<p>Intro.</p><img src="http://example.com/wp-content/uploads/foto-real.jpg" alt="">'
    vi.mocked(fetchBlogPostBySlug).mockResolvedValue(post)

    await router.push('/blog/algun-articulo')
    await router.isReady()
    mount(BlogPostView, {
      props: { slug: 'algun-articulo' },
      global: globalStubs,
    })

    await flushPromises()
    const ogImage = document.head.querySelector('meta[property="og:image"]')
    expect(ogImage?.getAttribute('content')).toBe('http://example.com/wp-content/uploads/foto-real.jpg')
  })

  it('shows a not-found message when the post does not exist', async () => {
    vi.mocked(fetchBlogPostBySlug).mockResolvedValue(null)

    await router.push('/blog/no-existe')
    await router.isReady()
    const wrapper = mount(BlogPostView, {
      props: { slug: 'no-existe' },
      global: globalStubs,
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No se encontró el artículo.')
  })

  it('shows an error message when the fetch fails', async () => {
    vi.mocked(fetchBlogPostBySlug).mockRejectedValue(new Error('boom'))

    await router.push('/blog/algun-articulo')
    await router.isReady()
    const wrapper = mount(BlogPostView, {
      props: { slug: 'algun-articulo' },
      global: globalStubs,
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('boom')
  })
})
