import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import TeamMemberView from '../TeamMemberView.vue'
import router from '../../router'
import type { ProfesionalPost, WordPressMedia } from '../../types/api'

const { fetchProfesionalBySlugMock, fetchMediaByIdMock } = vi.hoisted(() => ({
  fetchProfesionalBySlugMock: vi.fn<() => Promise<ProfesionalPost | null>>(),
  fetchMediaByIdMock: vi.fn<() => Promise<WordPressMedia | null>>(),
}))

vi.mock('../../services/dataService', () => ({
  fetchProfesionalBySlug: fetchProfesionalBySlugMock,
  fetchMediaById: fetchMediaByIdMock,
}))

function makePost(overrides: Partial<ProfesionalPost> = {}): ProfesionalPost {
  return {
    id: 1,
    date: '',
    date_gmt: '',
    guid: { rendered: '' },
    modified: '',
    modified_gmt: '',
    slug: 'ana-garcia',
    status: 'publish',
    type: 'profesional',
    link: '',
    title: { rendered: 'Ana García' },
    content: { rendered: '' },
    excerpt: { rendered: '' },
    author: 1,
    featured_media: 0,
    comment_status: '',
    ping_status: '',
    sticky: false,
    template: '',
    format: '',
    acf: {
      position: 'Psicóloga Infantil',
      hero_image: 0,
      short_description: 'Bio paragraph one.',
      work_description: '',
      license_number: 'CV12345',
      academic_training: 'Grado en Psicología',
      extra_training: 'Curso de terapia infantil',
    },
    ...overrides,
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
    fetchProfesionalBySlugMock.mockReset()
    fetchMediaByIdMock.mockReset()
  })

  it('shows a loading state before the post resolves', async () => {
    fetchProfesionalBySlugMock.mockReturnValue(new Promise(() => {}))
    await router.push('/equipo/ana-garcia')
    await router.isReady()

    // `props: true` on the route wires the slug when navigated via
    // <router-view>, but mounting the component directly bypasses that, so
    // the prop is passed explicitly here to match what the route would give it.
    const wrapper = mount(TeamMemberView, { props: { slug: 'ana-garcia' }, global: globalStubs })
    expect(wrapper.text()).toContain('Cargando')
  })

  it('renders the profile fetched by slug, parsed from the ACF fields', async () => {
    fetchProfesionalBySlugMock.mockResolvedValue(makePost())
    await router.push('/equipo/ana-garcia')
    await router.isReady()

    const wrapper = mount(TeamMemberView, { props: { slug: 'ana-garcia' }, global: globalStubs })
    await flushPromises()

    expect(fetchProfesionalBySlugMock).toHaveBeenCalledWith('ana-garcia')
    expect(wrapper.text()).toContain('Ana García')
    expect(wrapper.text()).toContain('Psicóloga Infantil')
    expect(wrapper.text()).toContain('Nº de colegiada: CV12345')
    expect(wrapper.text()).toContain('Bio paragraph one.')
    expect(wrapper.text()).toContain('Grado en Psicología')
    expect(wrapper.text()).toContain('Curso de terapia infantil')
  })

  it('resolves the photo from hero_image via fetchMediaById when present', async () => {
    fetchProfesionalBySlugMock.mockResolvedValue(makePost({ acf: { ...makePost().acf, hero_image: 42 } }))
    fetchMediaByIdMock.mockResolvedValue({ id: 42, source_url: 'https://example.com/photo.jpg' })
    await router.push('/equipo/ana-garcia')
    await router.isReady()

    const wrapper = mount(TeamMemberView, { props: { slug: 'ana-garcia' }, global: globalStubs })
    await flushPromises()

    expect(fetchMediaByIdMock).toHaveBeenCalledWith(42)
    expect(wrapper.find('.kb-profile__image').attributes('src')).toBe(
      'https://example.com/photo.jpg',
    )
  })

  it('shows a not-found message when the API has no post for that slug', async () => {
    fetchProfesionalBySlugMock.mockResolvedValue(null)
    await router.push('/equipo/no-existe')
    await router.isReady()

    const wrapper = mount(TeamMemberView, { props: { slug: 'no-existe' }, global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('No se encontró a esta profesional.')
  })

  it('shows an error message when the fetch fails', async () => {
    fetchProfesionalBySlugMock.mockRejectedValue(new Error('network down'))
    await router.push('/equipo/ana-garcia')
    await router.isReady()

    const wrapper = mount(TeamMemberView, { props: { slug: 'ana-garcia' }, global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Error: network down')
  })
})
