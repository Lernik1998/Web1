import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../../router'
import InfantilView from '../InfantilView.vue'
import { fetchTherapieBySlug } from '../../../services/dataService'
import type { TherapiePost } from '../../../types/api'

vi.mock('../../../services/dataService', () => ({
  fetchTherapieBySlug: vi.fn<() => Promise<TherapiePost | null>>(),
}))

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

function makeTherapy(overrides: Partial<TherapiePost> = {}): TherapiePost {
  return {
    id: 1,
    date: '2024-01-01',
    date_gmt: '2024-01-01',
    guid: { rendered: 'guid' },
    modified: '2024-01-01',
    modified_gmt: '2024-01-01',
    slug: 'psicologia-infantil',
    status: 'publish',
    type: 'therapie',
    link: 'https://example.com/psicologia-infantil',
    title: { rendered: 'Psicología infantil (WP)' },
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
      therapy_name: 'Psicología infantil (WP)',
      specialty: 'default',
      therapy_description: 'Intro paragraph text about this therapy.',
      therapy_image: 0,
      when_title: 'Síntomas',
      when_items: 'Symptom one\r\nSymptom two',
      how_title: 'Tratamiento',
      how_description: 'Treatment description text.',
      benefits_title: 'Qué te llevas del proceso',
      benefits_items: 'Benefit one\r\nBenefit two',
      faq_label: 'Dudas frecuentes',
      question_1: 'Question one?',
      answer_1: 'Answer one.',
    },
    ...overrides,
  }
}

describe('InfantilView', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    router.push('/terapias/infantil')
    await router.isReady()
  })

  it('shows a loading indicator before the fetch resolves', () => {
    let resolvePromise: (value: TherapiePost | null) => void = () => {}
    vi.mocked(fetchTherapieBySlug).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )

    const wrapper = mount(InfantilView, {
      global: { plugins: [router], directives },
    })

    expect(wrapper.text()).toContain('Cargando')
    resolvePromise(null)
  })

  it('renders intro, block titles, list items and text content after fetch resolves', async () => {
    vi.mocked(fetchTherapieBySlug).mockResolvedValue(makeTherapy())

    const wrapper = mount(InfantilView, {
      global: { plugins: [router], directives },
    })

    await flushPromises()

    expect(fetchTherapieBySlug).toHaveBeenCalledWith('psicologia-infantil')
    expect(wrapper.text()).toContain('Psicología infantil (WP)')
    expect(wrapper.text()).toContain('Intro paragraph text about this therapy.')
    expect(wrapper.text()).toContain('Síntomas')
    expect(wrapper.text()).toContain('Tratamiento')
    expect(wrapper.text()).toContain('Treatment description text.')

    const items = wrapper.findAll('.kb-therapy__list li')
    const itemTexts = items.map((i) => i.text())
    expect(itemTexts).toContain('Symptom one')
    expect(itemTexts).toContain('Symptom two')

    expect(wrapper.text()).toContain('Dudas frecuentes')
    expect(wrapper.text()).toContain('Question one?')
  })

  it('hides the FAQ block when the therapy has no question/answer pairs set', async () => {
    vi.mocked(fetchTherapieBySlug).mockResolvedValue(
      makeTherapy({
        acf: {
          ...makeTherapy().acf,
          faq_label: undefined,
          question_1: undefined,
          answer_1: undefined,
        },
      }),
    )

    const wrapper = mount(InfantilView, {
      global: { plugins: [router], directives },
    })

    await flushPromises()

    expect(wrapper.text()).not.toContain('Dudas frecuentes')
  })

  it('falls back to the default title and does not crash when the therapy is null', async () => {
    vi.mocked(fetchTherapieBySlug).mockResolvedValue(null)

    const wrapper = mount(InfantilView, {
      global: { plugins: [router], directives },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Psicología infantil')
    expect(wrapper.findAll('.kb-therapy__block').length).toBeGreaterThan(0)
  })
})
