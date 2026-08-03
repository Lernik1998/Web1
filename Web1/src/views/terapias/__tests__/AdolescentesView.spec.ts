import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../../router'
import AdolescentesView from '../AdolescentesView.vue'
import { fetchAdolescentPsychologyPage } from '../../../services/dataService'
import type { WordPressPage } from '../../../types/api'

vi.mock('../../../services/dataService', () => ({
  fetchAdolescentPsychologyPage: vi.fn<() => Promise<WordPressPage | null>>(),
}))

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

function makePage(overrides: Partial<WordPressPage> = {}): WordPressPage {
  return {
    id: 2,
    date: '2024-01-01',
    date_gmt: '2024-01-01',
    guid: { rendered: 'guid' },
    modified: '2024-01-01',
    modified_gmt: '2024-01-01',
    slug: 'psychology-for-adolescents',
    status: 'publish',
    type: 'page',
    link: 'https://example.com/psychology-for-adolescents',
    title: { rendered: 'Psicología para adolescentes (WP)' },
    content: {
      rendered:
        '<p>Intro paragraph text about this therapy.</p><h2>Síntomas</h2><ul><li>Symptom one</li><li>Symptom two</li></ul><h2>Tratamiento</h2><p>Treatment description text.</p>',
    },
    excerpt: { rendered: '' },
    author: 1,
    featured_media: 0,
    comment_status: 'closed',
    ping_status: 'closed',
    sticky: false,
    template: '',
    format: 'standard',
    ...overrides,
  }
}

describe('AdolescentesView', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    router.push('/terapias/adolescentes')
    await router.isReady()
  })

  it('shows a loading indicator before the fetch resolves', () => {
    let resolvePromise: (value: WordPressPage | null) => void = () => {}
    vi.mocked(fetchAdolescentPsychologyPage).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )

    const wrapper = mount(AdolescentesView, {
      global: { plugins: [router], directives },
    })

    expect(wrapper.text()).toContain('Cargando')
    resolvePromise(null)
  })

  it('renders intro, block titles, list items and text content after fetch resolves', async () => {
    vi.mocked(fetchAdolescentPsychologyPage).mockResolvedValue(makePage())

    const wrapper = mount(AdolescentesView, {
      global: { plugins: [router], directives },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Psicología para adolescentes (WP)')
    expect(wrapper.text()).toContain('Intro paragraph text about this therapy.')
    expect(wrapper.text()).toContain('Síntomas')
    expect(wrapper.text()).toContain('Tratamiento')
    expect(wrapper.text()).toContain('Treatment description text.')

    const items = wrapper.findAll('.kb-therapy__list li')
    const itemTexts = items.map((i) => i.text())
    expect(itemTexts).toContain('Symptom one')
    expect(itemTexts).toContain('Symptom two')
  })

  it('falls back to the default title and does not crash when the page is null', async () => {
    vi.mocked(fetchAdolescentPsychologyPage).mockResolvedValue(null)

    const wrapper = mount(AdolescentesView, {
      global: { plugins: [router], directives },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Psicología para adolescentes')
    expect(wrapper.findAll('.kb-therapy__block').length).toBeGreaterThan(0)
  })
})
