import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import EquipoView from '../EquipoView.vue'
import router from '../../router'
import type { WordPressPage } from '../../types/api'

const { fetchTeamPageMock } = vi.hoisted(() => ({
  fetchTeamPageMock: vi.fn<() => Promise<WordPressPage | null>>(),
}))

vi.mock('../../services/dataService', () => ({
  fetchTeamPage: fetchTeamPageMock,
}))

const TEAM_HTML =
  '<p><strong>Ana García</strong></p><p><strong>Psicóloga Infantil</strong></p>' +
  '<p>Bio paragraph one.</p><p>Formación académica</p><ul><li>Grado en Psicología</li></ul>' +
  '<p>Formación extracurricular</p><ul><li>Curso de terapia infantil</li></ul>'

function makePage(html: string): WordPressPage {
  return {
    id: 1,
    date: '',
    date_gmt: '',
    guid: { rendered: '' },
    modified: '',
    modified_gmt: '',
    slug: 'team',
    status: 'publish',
    type: 'page',
    link: '',
    title: { rendered: 'Team' },
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

describe('EquipoView', () => {
  beforeEach(() => {
    fetchTeamPageMock.mockReset()
  })

  it('shows a loading state before the page resolves', async () => {
    fetchTeamPageMock.mockReturnValue(new Promise(() => {}))
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    expect(wrapper.text()).toContain('Cargando equipo')
  })

  it('renders parsed team members from the fetched page', async () => {
    fetchTeamPageMock.mockResolvedValue(makePage(TEAM_HTML))
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Ana García')
    expect(wrapper.text()).toContain('Más sobre Ana')
    const link = wrapper.find('a[href="/equipo/ana-garcia"]')
    expect(link.exists()).toBe(true)
  })

  it('shows an error message when the fetch fails', async () => {
    fetchTeamPageMock.mockRejectedValue(new Error('network down'))
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Error: network down')
  })

  it('renders an empty grid when there is no page', async () => {
    fetchTeamPageMock.mockResolvedValue(null)
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.findAll('.kb-team-card')).toHaveLength(0)
  })
})
