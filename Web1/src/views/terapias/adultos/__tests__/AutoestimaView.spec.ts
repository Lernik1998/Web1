import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../../../router'
import AutoestimaView from '../AutoestimaView.vue'
import { fetchTherapieBySlug } from '../../../../services/dataService'
import type { TherapiePost } from '../../../../types/api'

vi.mock('../../../../services/dataService', () => ({
  fetchTherapieBySlug: vi.fn<() => Promise<TherapiePost | null>>(),
}))

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

function makeTherapy(overrides: Partial<TherapiePost> = {}): TherapiePost {
  return {
    id: 5,
    date: '2024-01-01',
    date_gmt: '2024-01-01',
    guid: { rendered: 'guid' },
    modified: '2024-01-01',
    modified_gmt: '2024-01-01',
    slug: 'autoestima-y-desarrollo-personal',
    status: 'publish',
    type: 'therapie',
    link: 'https://example.com/autoestima-y-desarrollo-personal',
    title: { rendered: 'Autoestima y desarrollo personal (WP)' },
    content: { rendered: '' },
    excerpt: { rendered: '' },
    author: 1,
    featured_media: 0,
    comment_status: 'closed',
    ping_status: 'closed',
    sticky: false,
    template: '',
    format: 'standard',
    acf: {
      therapy_name: 'Autoestima y desarrollo personal (WP)',
      specialty: 'adult',
      therapy_description: 'Intro paragraph text about this therapy.',
      therapy_image: 0,
      when_title: 'Síntomas',
      when_items: 'Symptom one\r\nSymptom two',
      how_title: 'Tratamiento',
      how_description: 'Treatment description text.',
      benefits_title: 'Qué te llevas del proceso',
      benefits_items: 'Benefit one\r\nBenefit two',
    },
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
    let resolvePromise: (value: TherapiePost | null) => void = () => {}
    vi.mocked(fetchTherapieBySlug).mockReturnValue(
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
    vi.mocked(fetchTherapieBySlug).mockResolvedValue(makeTherapy())

    const wrapper = mount(AutoestimaView, {
      global: { plugins: [router], directives },
    })

    await flushPromises()

    expect(fetchTherapieBySlug).toHaveBeenCalledWith('autoestima-y-desarrollo-personal')
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

  it('falls back to the default title and does not crash when the therapy is null', async () => {
    vi.mocked(fetchTherapieBySlug).mockResolvedValue(null)

    const wrapper = mount(AutoestimaView, {
      global: { plugins: [router], directives },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Autoestima y desarrollo personal')
    expect(wrapper.findAll('.kb-therapy__block').length).toBeGreaterThan(0)
  })
})
