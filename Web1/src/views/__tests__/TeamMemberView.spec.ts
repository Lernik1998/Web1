import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import TeamMemberView from '../TeamMemberView.vue'
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

describe('TeamMemberView', () => {
  beforeEach(() => {
    fetchTeamPageMock.mockReset()
  })

  it('shows a loading state before the page resolves', async () => {
    fetchTeamPageMock.mockReturnValue(new Promise(() => {}))
    await router.push('/equipo/ana-garcia')
    await router.isReady()

    // `props: true` on the route wires the slug when navigated via
    // <router-view>, but mounting the component directly bypasses that, so
    // the prop is passed explicitly here to match what the route would give it.
    const wrapper = mount(TeamMemberView, { props: { slug: 'ana-garcia' }, global: globalStubs })
    expect(wrapper.text()).toContain('Cargando')
  })

  it('renders the matching member profile for the route slug', async () => {
    fetchTeamPageMock.mockResolvedValue(makePage(TEAM_HTML))
    await router.push('/equipo/ana-garcia')
    await router.isReady()

    const wrapper = mount(TeamMemberView, { props: { slug: 'ana-garcia' }, global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Ana García')
    expect(wrapper.text()).toContain('Psicóloga Infantil')
    expect(wrapper.text()).toContain('Bio paragraph one.')
    expect(wrapper.text()).toContain('Grado en Psicología')
    expect(wrapper.text()).toContain('Curso de terapia infantil')
  })

  it('shows a not-found message when the slug does not match any member', async () => {
    fetchTeamPageMock.mockResolvedValue(makePage(TEAM_HTML))
    await router.push('/equipo/no-existe')
    await router.isReady()

    const wrapper = mount(TeamMemberView, { props: { slug: 'no-existe' }, global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('No se encontró a esta profesional.')
  })

  it('shows an error message when the fetch fails', async () => {
    fetchTeamPageMock.mockRejectedValue(new Error('network down'))
    await router.push('/equipo/ana-garcia')
    await router.isReady()

    const wrapper = mount(TeamMemberView, { props: { slug: 'ana-garcia' }, global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Error: network down')
  })
})
