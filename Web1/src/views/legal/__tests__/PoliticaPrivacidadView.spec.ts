import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PoliticaPrivacidadView from '../PoliticaPrivacidadView.vue'
import router from '../../../router'
import type { WordPressPage } from '../../../types/api'

const { fetchPoliticaPrivacidadPageMock } = vi.hoisted(() => ({
  fetchPoliticaPrivacidadPageMock: vi.fn<() => Promise<WordPressPage | null>>(),
}))

vi.mock('../../../services/dataService', () => ({
  fetchPoliticaPrivacidadPage: fetchPoliticaPrivacidadPageMock,
}))

function makePage(html: string): WordPressPage {
  return {
    id: 1,
    date: '',
    date_gmt: '',
    guid: { rendered: '' },
    modified: '',
    modified_gmt: '',
    slug: 'politica-privacidad',
    status: 'publish',
    type: 'page',
    link: '',
    title: { rendered: 'Política de Privacidad' },
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

describe('PoliticaPrivacidadView', () => {
  beforeEach(() => {
    fetchPoliticaPrivacidadPageMock.mockReset()
  })

  it('shows a loading state before the page resolves', async () => {
    fetchPoliticaPrivacidadPageMock.mockReturnValue(new Promise(() => {}))
    await router.push('/politica-privacidad')
    await router.isReady()

    const wrapper = mount(PoliticaPrivacidadView, { global: globalStubs })
    expect(wrapper.text()).toContain('Cargando política de privacidad')
  })

  it('renders the fetched privacy content via v-html', async () => {
    fetchPoliticaPrivacidadPageMock.mockResolvedValue(
      makePage('<h2>Responsable del tratamiento</h2><p>Tus datos están protegidos.</p>'),
    )
    await router.push('/politica-privacidad')
    await router.isReady()

    const wrapper = mount(PoliticaPrivacidadView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.find('.kb-prose').html()).toContain('Responsable del tratamiento')
    expect(wrapper.text()).toContain('Tus datos están protegidos.')
  })

  it('shows an error message when the fetch fails', async () => {
    fetchPoliticaPrivacidadPageMock.mockRejectedValue(new Error('network down'))
    await router.push('/politica-privacidad')
    await router.isReady()

    const wrapper = mount(PoliticaPrivacidadView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Error: network down')
  })

  it('shows a not-found message when there is no page', async () => {
    fetchPoliticaPrivacidadPageMock.mockResolvedValue(null)
    await router.push('/politica-privacidad')
    await router.isReady()

    const wrapper = mount(PoliticaPrivacidadView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('No se encontró la política de privacidad.')
  })
})
