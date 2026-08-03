import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AvisoLegalView from '../AvisoLegalView.vue'
import router from '../../../router'
import type { WordPressPage } from '../../../types/api'

const { fetchAvisoLegalPageMock } = vi.hoisted(() => ({
  fetchAvisoLegalPageMock: vi.fn<() => Promise<WordPressPage | null>>(),
}))

vi.mock('../../../services/dataService', () => ({
  fetchAvisoLegalPage: fetchAvisoLegalPageMock,
}))

function makePage(html: string): WordPressPage {
  return {
    id: 1,
    date: '',
    date_gmt: '',
    guid: { rendered: '' },
    modified: '',
    modified_gmt: '',
    slug: 'aviso-legal',
    status: 'publish',
    type: 'page',
    link: '',
    title: { rendered: 'Aviso Legal' },
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

describe('AvisoLegalView', () => {
  beforeEach(() => {
    fetchAvisoLegalPageMock.mockReset()
  })

  it('shows a loading state before the page resolves', async () => {
    fetchAvisoLegalPageMock.mockReturnValue(new Promise(() => {}))
    await router.push('/aviso-legal')
    await router.isReady()

    const wrapper = mount(AvisoLegalView, { global: globalStubs })
    expect(wrapper.text()).toContain('Cargando aviso legal')
  })

  it('renders the fetched legal content via v-html', async () => {
    fetchAvisoLegalPageMock.mockResolvedValue(
      makePage('<h2>Titular del sitio</h2><p>Datos de la empresa.</p>'),
    )
    await router.push('/aviso-legal')
    await router.isReady()

    const wrapper = mount(AvisoLegalView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.find('.kb-prose').html()).toContain('Titular del sitio')
    expect(wrapper.text()).toContain('Datos de la empresa.')
  })

  it('shows an error message when the fetch fails', async () => {
    fetchAvisoLegalPageMock.mockRejectedValue(new Error('network down'))
    await router.push('/aviso-legal')
    await router.isReady()

    const wrapper = mount(AvisoLegalView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Error: network down')
  })

  it('shows a not-found message when there is no page', async () => {
    fetchAvisoLegalPageMock.mockResolvedValue(null)
    await router.push('/aviso-legal')
    await router.isReady()

    const wrapper = mount(AvisoLegalView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('No se encontró el aviso legal.')
  })
})
