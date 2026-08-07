import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import router from '../../router'
import HomeView from '../HomeView.vue'
import type {
  WordPressHomePage,
  WordPressMedia,
  GoogleReview,
  TherapiePost,
} from '../../types/api'

vi.mock('../../services/dataService')

import {
  fetchHomePage,
  fetchMediaById,
  fetchGoogleReviews,
  fetchTherapieBySlug,
} from '../../services/dataService'

const globalStubs = {
  directives: { 'animate-on-scroll': {}, spotlight: {}, ripple: {} },
  plugins: [router],
}

function makeHomePage(): WordPressHomePage {
  return {
    id: 1,
    date: '2026-01-01T00:00:00',
    date_gmt: '2026-01-01T00:00:00',
    guid: { rendered: 'http://example.com/?p=1' },
    modified: '2026-01-01T00:00:00',
    modified_gmt: '2026-01-01T00:00:00',
    slug: 'home',
    status: 'publish',
    type: 'page',
    link: 'http://example.com/home',
    title: { rendered: 'Inicio' },
    content: { rendered: '<p>contenido</p>' },
    excerpt: { rendered: '<p>extracto</p>' },
    author: 1,
    featured_media: 0,
    comment_status: 'closed',
    ping_status: 'closed',
    sticky: false,
    template: '',
    format: 'standard',
    acf: {
      hero_title: 'Bienvenida a Kanbouri',
      hero_description: 'Descripción del hero',
      hero_image: 10,
      hero_button_text: 'Pedir cita',
      therapy_1_title: 'Infantil',
      therapy_2_title_: 'Adolescentes',
      therapy_3_title: 'Adultos',
      therapy_4_title: 'Padres y familia',
      therapy_1_description: 'Descripción infantil',
      therapy_2_description: 'Descripción adolescentes',
      therapy_3_description: 'Descripción adultos',
      therapy_4_description: 'Descripción padres',
      therapy_1_image: 11,
      therapy_2_image: 12,
      therapy_3_image: 13,
      therapy_4_image: 14,
      therapy_1_button_text: 'Me interesa',
      therapy_2_button_text: 'Me interesa',
      therapy_3_button_text: 'Me interesa',
      therapy_4_button_text: 'Me interesa',
    },
  }
}

function makeMedia(id: number): WordPressMedia {
  return { id, source_url: 'http://example.com/img.jpg', alt_text: '' }
}

function makeTherapiePost(overrides: {
  slug: string
  title: string
  description: string
  imageId: number
  cardDescription?: string
}): TherapiePost {
  return {
    id: 100,
    date: '2026-01-01T00:00:00',
    date_gmt: '2026-01-01T00:00:00',
    guid: { rendered: 'http://example.com/?p=100' },
    modified: '2026-01-01T00:00:00',
    modified_gmt: '2026-01-01T00:00:00',
    slug: overrides.slug,
    status: 'publish',
    type: 'therapie',
    link: `http://example.com/${overrides.slug}`,
    title: { rendered: overrides.title },
    content: { rendered: '' },
    excerpt: { rendered: '' },
    author: 1,
    featured_media: 0,
    comment_status: 'closed',
    ping_status: 'closed',
    sticky: false,
    template: '',
    format: 'standard',
    acf: {
      therapy_name: overrides.title,
      specialty: 'adult',
      therapy_description: overrides.description,
      therapy_image: overrides.imageId,
      when_title: '',
      when_items: '',
      how_title: '',
      how_description: '',
      benefits_title: '',
      benefits_items: '',
      card_description: overrides.cardDescription,
    },
  }
}

describe('HomeView', () => {
  beforeEach(() => {
    vi.mocked(fetchGoogleReviews).mockResolvedValue([] as GoogleReview[])
    vi.mocked(fetchTherapieBySlug).mockResolvedValue(null)
  })

  it('shows a loading state before data arrives', async () => {
    let resolveHome: (value: WordPressHomePage) => void = () => {}
    vi.mocked(fetchHomePage).mockReturnValue(
      new Promise((resolve) => {
        resolveHome = resolve
      }),
    )
    vi.mocked(fetchMediaById).mockResolvedValue(null)

    await router.push('/')
    await router.isReady()
    const wrapper = mount(HomeView, { global: globalStubs })

    expect(wrapper.findComponent({ name: 'LoadingSpinner' }).exists()).toBe(true)

    resolveHome(makeHomePage())
    await flushPromises()
  })

  it('renders hero and therapy cards once data has loaded', async () => {
    vi.mocked(fetchHomePage).mockResolvedValue(makeHomePage())
    vi.mocked(fetchMediaById).mockImplementation(async (id: number) => makeMedia(id))

    await router.push('/')
    await router.isReady()
    const wrapper = mount(HomeView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Bienvenida a Kanbouri')
    expect(wrapper.text()).toContain('Infantil')
    expect(wrapper.text()).toContain('Adolescentes')
    expect(wrapper.text()).toContain('Adultos')
    expect(wrapper.text()).toContain('Padres y familia')
  })

  it('includes the adult sub-therapies alongside the main 4 cards, linking to their own pages', async () => {
    vi.mocked(fetchHomePage).mockResolvedValue(makeHomePage())
    vi.mocked(fetchMediaById).mockImplementation(async (id: number) => makeMedia(id))
    vi.mocked(fetchTherapieBySlug).mockImplementation(async (slug: string) => {
      const bySlug: Record<string, TherapiePost> = {
        ansiedad: makeTherapiePost({
          slug: 'ansiedad',
          title: 'Ansiedad',
          description: 'Descripción ansiedad',
          imageId: 341,
        }),
        'depresion-y-estado-de-animo': makeTherapiePost({
          slug: 'depresion-y-estado-de-animo',
          title: 'Depresión y estado de ánimo',
          description: 'Descripción depresión',
          imageId: 241,
        }),
        'autoestima-y-desarrollo-personal': makeTherapiePost({
          slug: 'autoestima-y-desarrollo-personal',
          title: 'Autoestima y desarrollo personal',
          description: 'Descripción autoestima',
          imageId: 65,
        }),
        'duelo-y-perdidas': makeTherapiePost({
          slug: 'duelo-y-perdidas',
          title: 'Duelo y pérdidas',
          description: 'Descripción duelo',
          imageId: 240,
        }),
      }
      return bySlug[slug] ?? null
    })

    await router.push('/')
    await router.isReady()
    const wrapper = mount(HomeView, {
      global: { ...globalStubs, stubs: { RouterLink: RouterLinkStub } },
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    // Las 4 tarjetas principales siguen presentes...
    expect(wrapper.text()).toContain('Infantil')
    expect(wrapper.text()).toContain('Adultos')

    // ...y también las 4 terapias específicas de "Psicología para adultos".
    expect(wrapper.text()).toContain('Ansiedad')
    expect(wrapper.text()).toContain('Depresión y estado de ánimo')
    expect(wrapper.text()).toContain('Autoestima y desarrollo personal')
    expect(wrapper.text()).toContain('Duelo y pérdidas')

    const links = wrapper.findAllComponents(RouterLinkStub)
    const hrefs = links.map((link) => link.props('to'))
    expect(hrefs).toContain('/terapias/adultos/ansiedad')
    expect(hrefs).toContain('/terapias/adultos/depresion')
    expect(hrefs).toContain('/terapias/adultos/autoestima')
    expect(hrefs).toContain('/terapias/adultos/duelo')
  })

  it('uses card_description for a sub-therapy card when set, instead of the page description', async () => {
    vi.mocked(fetchHomePage).mockResolvedValue(makeHomePage())
    vi.mocked(fetchMediaById).mockImplementation(async (id: number) => makeMedia(id))
    vi.mocked(fetchTherapieBySlug).mockImplementation(async (slug: string) => {
      if (slug !== 'ansiedad') return null
      return makeTherapiePost({
        slug: 'ansiedad',
        title: 'Ansiedad',
        description: 'Texto largo de la página propia de Ansiedad.',
        imageId: 341,
        cardDescription: 'Texto corto solo para la tarjeta de inicio.',
      })
    })

    await router.push('/')
    await router.isReady()
    const wrapper = mount(HomeView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Texto corto solo para la tarjeta de inicio.')
    expect(wrapper.text()).not.toContain('Texto largo de la página propia de Ansiedad.')
  })

  it('falls back to the page description when card_description is not set in WordPress', async () => {
    vi.mocked(fetchHomePage).mockResolvedValue(makeHomePage())
    vi.mocked(fetchMediaById).mockImplementation(async (id: number) => makeMedia(id))
    vi.mocked(fetchTherapieBySlug).mockImplementation(async (slug: string) => {
      if (slug !== 'ansiedad') return null
      return makeTherapiePost({
        slug: 'ansiedad',
        title: 'Ansiedad',
        description: 'Texto de la página propia de Ansiedad.',
        imageId: 341,
        // Sin cardDescription: debe caer en therapy_description.
      })
    })

    await router.push('/')
    await router.isReady()
    const wrapper = mount(HomeView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Texto de la página propia de Ansiedad.')
  })

  it('shows the "no data" message when the page is not found', async () => {
    vi.mocked(fetchHomePage).mockResolvedValue(null)
    vi.mocked(fetchMediaById).mockResolvedValue(null)

    await router.push('/')
    await router.isReady()
    const wrapper = mount(HomeView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain("No se encontró la página con slug 'home'")
  })

  it('shows an error message when fetching fails', async () => {
    vi.mocked(fetchHomePage).mockRejectedValue(new Error('network down'))
    vi.mocked(fetchMediaById).mockResolvedValue(null)

    await router.push('/')
    await router.isReady()
    const wrapper = mount(HomeView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('network down')
  })
})
