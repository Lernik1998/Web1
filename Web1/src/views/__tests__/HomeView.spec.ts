import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../router'
import HomeView from '../HomeView.vue'
import type { WordPressHomePage, WordPressMedia, GoogleReview } from '../../types/api'

vi.mock('../../services/dataService')

import { fetchHomePage, fetchMediaById, fetchGoogleReviews } from '../../services/dataService'

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

describe('HomeView', () => {
  beforeEach(() => {
    vi.mocked(fetchGoogleReviews).mockResolvedValue([] as GoogleReview[])
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
