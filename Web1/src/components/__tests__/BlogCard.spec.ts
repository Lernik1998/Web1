import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import BlogCard from '../BlogCard.vue'
import type { WordPressPost } from '../../types/api'

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

function makePost(overrides: Partial<WordPressPost> = {}): WordPressPost {
  return {
    id: 1,
    date: '2024-05-10T00:00:00',
    date_gmt: '2024-05-10T00:00:00',
    guid: { rendered: 'guid' },
    modified: '2024-05-10T00:00:00',
    modified_gmt: '2024-05-10T00:00:00',
    slug: 'mi-articulo',
    status: 'publish',
    type: 'post',
    link: 'https://example.com/mi-articulo',
    title: { rendered: 'Mi articulo de prueba' },
    content: { rendered: '<p>Contenido completo del articulo</p>' },
    excerpt: { rendered: '<p>Un extracto breve del articulo</p>' },
    author: 1,
    featured_media: 0,
    comment_status: 'closed',
    ping_status: 'closed',
    sticky: false,
    template: '',
    format: 'standard',
    ...overrides,
  } as WordPressPost
}

describe('BlogCard', () => {
  it('renders title, excerpt and fallback image from post prop', () => {
    const wrapper = mount(BlogCard, {
      global: {
        directives,
        stubs: { RouterLink: RouterLinkStub },
      },
      props: { post: makePost() },
    })

    expect(wrapper.text()).toContain('Mi articulo de prueba')
    expect(wrapper.text()).toContain('Un extracto breve del articulo')
    const img = wrapper.find('img.kb-blog-card__image')
    expect(img.attributes('src')).toBe('/images/psicologa-denia-hero.jpg')
  })

  it('uses the embedded featured media image when present', () => {
    const wrapper = mount(BlogCard, {
      global: {
        directives,
        stubs: { RouterLink: RouterLinkStub },
      },
      props: {
        post: makePost({
          _embedded: {
            'wp:featuredmedia': [{ source_url: 'https://example.com/photo.jpg', alt_text: 'Foto' }],
          },
        }),
      },
    })

    const img = wrapper.find('img.kb-blog-card__image')
    expect(img.attributes('src')).toBe('https://example.com/photo.jpg')
    expect(img.attributes('alt')).toBe('Foto')
  })

  it('renders the category name when embedded terms are present', () => {
    const wrapper = mount(BlogCard, {
      global: {
        directives,
        stubs: { RouterLink: RouterLinkStub },
      },
      props: {
        post: makePost({
          _embedded: {
            'wp:term': [[{ id: 1, name: 'Ansiedad', slug: 'ansiedad', taxonomy: 'category' }]],
          },
        }),
      },
    })

    expect(wrapper.find('.kb-blog-card__category').text()).toBe('Ansiedad')
  })

  it('links to the post slug', () => {
    const wrapper = mount(BlogCard, {
      global: {
        directives,
        stubs: { RouterLink: RouterLinkStub },
      },
      props: { post: makePost({ slug: 'otro-slug' }) },
    })

    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.props('to')).toBe('/blog/otro-slug')
    }
  })
})
