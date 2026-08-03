import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PoliticaCookiesView from '../PoliticaCookiesView.vue'
import router from '../../../router'
import type { WordPressPage } from '../../../types/api'

const { fetchPoliticaCookiesPageMock } = vi.hoisted(() => ({
  fetchPoliticaCookiesPageMock: vi.fn<() => Promise<WordPressPage | null>>(),
}))

vi.mock('../../../services/dataService', () => ({
  fetchPoliticaCookiesPage: fetchPoliticaCookiesPageMock,
}))

function makePage(html: string): WordPressPage {
  return {
    id: 1,
    date: '',
    date_gmt: '',
    guid: { rendered: '' },
    modified: '',
    modified_gmt: '',
    slug: 'politica-de-cookies-ue',
    status: 'publish',
    type: 'page',
    link: '',
    title: { rendered: 'Política de Cookies' },
    content: { rendered: html },
    excerpt: { rendered: '' },
    author: 1,
    featured_media: 0,
    comment_status: '',
    ping_status: '',
    sticky: false,
    template: '',
    format: '',
  }
}

const globalStubs = {
  directives: {
    'animate-on-scroll': {},
    spotlight: {},
    ripple: {},
  },
  plugins: [router],
}

describe('PoliticaCookiesView', () => {
  beforeEach(() => {
    fetchPoliticaCookiesPageMock.mockReset()
  })

  it('shows a loading state before the page resolves', async () => {
    fetchPoliticaCookiesPageMock.mockReturnValue(new Promise(() => {}))
    await router.push('/politica-cookies')
    await router.isReady()

    const wrapper = mount(PoliticaCookiesView, { global: globalStubs })
    expect(wrapper.text()).toContain('Cargando política de cookies')
  })

  it('renders the fetched cookies content via v-html', async () => {
    fetchPoliticaCookiesPageMock.mockResolvedValue(
      makePage('<h2>Qué son las cookies</h2><p>Usamos cookies propias.</p>'),
    )
    await router.push('/politica-cookies')
    await router.isReady()

    const wrapper = mount(PoliticaCookiesView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.find('.kb-prose').html()).toContain('Qué son las cookies')
    expect(wrapper.text()).toContain('Usamos cookies propias.')
  })

  it('shows an error message when the fetch fails', async () => {
    fetchPoliticaCookiesPageMock.mockRejectedValue(new Error('network down'))
    await router.push('/politica-cookies')
    await router.isReady()

    const wrapper = mount(PoliticaCookiesView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Error: network down')
  })

  it('shows a not-found message when there is no page', async () => {
    fetchPoliticaCookiesPageMock.mockResolvedValue(null)
    await router.push('/politica-cookies')
    await router.isReady()

    const wrapper = mount(PoliticaCookiesView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('No se encontró la política de cookies.')
  })
})
