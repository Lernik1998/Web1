import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import EquipoView from '../EquipoView.vue'
import router from '../../router'
import type { ProfesionalPost, WordPressMedia } from '../../types/api'

const { fetchProfesionalesMock, fetchMediaByIdMock } = vi.hoisted(() => ({
  fetchProfesionalesMock: vi.fn<() => Promise<ProfesionalPost[]>>(),
  fetchMediaByIdMock: vi.fn<() => Promise<WordPressMedia | null>>(),
}))

vi.mock('../../services/dataService', () => ({
  fetchProfesionales: fetchProfesionalesMock,
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
      short_description: '',
      work_description: '',
      license_number: '',
      academic_training: '',
      extra_training: '',
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

describe('EquipoView', () => {
  beforeEach(() => {
    fetchProfesionalesMock.mockReset()
    fetchMediaByIdMock.mockReset()
    fetchMediaByIdMock.mockResolvedValue(null)
  })

  it('shows a loading state before the list resolves', async () => {
    fetchProfesionalesMock.mockReturnValue(new Promise(() => {}))
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    expect(wrapper.text()).toContain('Cargando equipo')
  })

  it('renders a card per professional returned by the API', async () => {
    fetchProfesionalesMock.mockResolvedValue([
      makePost({ slug: 'ana-garcia', title: { rendered: 'Ana García' } }),
      makePost({ id: 2, slug: 'luis-perez', title: { rendered: 'Luis Pérez' } }),
    ])
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Ana García')
    expect(wrapper.text()).toContain('Más sobre Ana')
    expect(wrapper.find('a[href="/equipo/ana-garcia"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/equipo/luis-perez"]').exists()).toBe(true)
    expect(wrapper.findAll('.kb-team-card')).toHaveLength(2)
  })

  it('resolves each photo from hero_image via fetchMediaById when present', async () => {
    fetchProfesionalesMock.mockResolvedValue([
      makePost({ acf: { ...makePost().acf, hero_image: 42 } }),
    ])
    fetchMediaByIdMock.mockResolvedValue({ id: 42, source_url: 'https://example.com/photo.jpg' })
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    await flushPromises()

    expect(fetchMediaByIdMock).toHaveBeenCalledWith(42)
    expect(wrapper.find('.kb-team-card__image').attributes('src')).toBe(
      'https://example.com/photo.jpg',
    )
  })

  it('falls back to an initials placeholder when there is no photo anywhere', async () => {
    fetchProfesionalesMock.mockResolvedValue([makePost({ slug: 'sin-foto', title: { rendered: 'Sin Foto' } })])
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.find('.kb-team-card__placeholder').text()).toBe('SF')
  })

  it('shows an error message when the fetch fails', async () => {
    fetchProfesionalesMock.mockRejectedValue(new Error('network down'))
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Error: network down')
  })

  it('renders an empty grid when the API returns no professionals', async () => {
    fetchProfesionalesMock.mockResolvedValue([])
    await router.push('/equipo')
    await router.isReady()

    const wrapper = mount(EquipoView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.findAll('.kb-team-card')).toHaveLength(0)
  })
})
