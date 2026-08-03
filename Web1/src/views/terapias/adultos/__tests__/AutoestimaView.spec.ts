import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../../../router'
import AutoestimaView from '../AutoestimaView.vue'
import { fetchAdultSelfEsteemPage } from '../../../../services/dataService'
import type { WordPressPage } from '../../../../types/api'

vi.mock('../../../../services/dataService', () => ({
  fetchAdultSelfEsteemPage: vi.fn<() => Promise<WordPressPage | null>>(),
}))

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

function makePage(overrides: Partial<WordPressPage> = {}): WordPressPage {
  return {
    id: 5,
    date: '2024-01-01',
    date_gmt: '2024-01-01',
    guid: { rendered: 'guid' },
    modified: '2024-01-01',
    modified_gmt: '2024-01-01',
    slug: 'adult-self-esteem',
    status: 'publish',
    type: 'page',
    link: 'https://example.com/adult-self-esteem',
    title: { rendered: 'Autoestima y desarrollo personal (WP)' },
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

describe('AutoestimaView', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    router.push('/terapias/adultos/autoestima')
    await router.isReady()
  })

  it('shows a loading indicator before the fetch resolves', () => {
    let resolvePromise: (value: WordPressPage | null) => void = () => {}
    vi.mocked(fetchAdultSelfEsteemPage).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )

    const wrapper = mount(AutoestimaView, {
      global: { plugins: [router], directives },
    })

    expect(wrapper.text()).toContain('Cargando')
    resolvePromise(null)
  })

  it('renders intro, block titles, list items and text content after fetch resolves', async () => {
    vi.mocked(fetchAdultSelfEsteemPage).mockResolvedValue(makePage())

    const wrapper = mount(AutoestimaView, {
      global: { plugins: [router], directives },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Autoestima y desarrollo personal (WP)')
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
    vi.mocked(fetchAdultSelfEsteemPage).mockResolvedValue(null)

    const wrapper = mount(AutoestimaView, {
      global: { plugins: [router], directives },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Autoestima y desarrollo personal')
    expect(wrapper.findAll('.kb-therapy__block').length).toBeGreaterThan(0)
  })
})
