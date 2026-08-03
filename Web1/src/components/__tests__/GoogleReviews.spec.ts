import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GoogleReviews from '../GoogleReviews.vue'
import { fetchGoogleReviews } from '../../services/dataService'
import type { GoogleReview } from '../../types/api'

vi.mock('../../services/dataService')

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

const mockedFetch = vi.mocked(fetchGoogleReviews)

function makeReview(id: string, overrides: Partial<GoogleReview> = {}): GoogleReview {
  return {
    id,
    user: `Usuario ${id}`,
    user_photo: `https://example.com/${id}.jpg`,
    rating: '5',
    text: 'Muy buena experiencia, totalmente recomendable.',
    reply: '',
    date: '2024-01-01',
    ...overrides,
  }
}

describe('GoogleReviews', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
  })

  it('shows only full pages of 3 reviews, dropping the trailing incomplete group', async () => {
    const reviews = Array.from({ length: 7 }, (_, i) => makeReview(String(i + 1)))
    mockedFetch.mockResolvedValue(reviews)

    const wrapper = mount(GoogleReviews, {
      global: { directives },
    })
    await flushPromises()

    // 7 reviews -> 2 full pages of 3 = 6 shown on first page load (3 per page)
    expect(wrapper.findAll('.kb-review')).toHaveLength(3)

    const dots = wrapper.findAll('.kb-reviews__dot')
    expect(dots).toHaveLength(2)
    expect(dots[0]!.classes()).toContain('is-active')
    expect(dots[1]!.classes()).not.toContain('is-active')
  })

  it('navigates to the next and previous page using the nav buttons', async () => {
    const reviews = Array.from({ length: 7 }, (_, i) => makeReview(String(i + 1)))
    mockedFetch.mockResolvedValue(reviews)

    const wrapper = mount(GoogleReviews, {
      global: { directives },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Usuario 1')

    await wrapper.find('button[aria-label="Ver más reseñas"]').trigger('click')

    expect(wrapper.text()).toContain('Usuario 4')
    expect(wrapper.text()).not.toContain('Usuario 1')

    const dots = wrapper.findAll('.kb-reviews__dot')
    expect(dots[1]!.classes()).toContain('is-active')

    await wrapper.find('button[aria-label="Ver reseñas anteriores"]').trigger('click')

    expect(wrapper.text()).toContain('Usuario 1')
    expect(dots[0]!.classes()).toContain('is-active')
  })

  it('truncates long review text and toggles it with "Leer más" / "Ocultar"', async () => {
    const longText = 'Palabra '.repeat(40).trim() // > 220 chars
    const reviews = [
      makeReview('1', { text: longText }),
      makeReview('2'),
      makeReview('3'),
    ]
    mockedFetch.mockResolvedValue(reviews)

    const wrapper = mount(GoogleReviews, {
      global: { directives },
    })
    await flushPromises()

    const toggleButtons = wrapper.findAll('.kb-review__toggle')
    expect(toggleButtons).toHaveLength(1)
    expect(toggleButtons[0]!.text()).toBe('Leer más')

    const firstReviewText = wrapper.findAll('.kb-review__text')[0]!
    expect(firstReviewText.text().length).toBeLessThan(longText.length)

    await toggleButtons[0]!.trigger('click')

    expect(toggleButtons[0]!.text()).toBe('Ocultar')
    expect(wrapper.findAll('.kb-review__text')[0]!.text()).toBe(longText)
  })

  it('does not render the section when there are no reviews and loading has finished', async () => {
    mockedFetch.mockResolvedValue([])

    const wrapper = mount(GoogleReviews, {
      global: { directives },
    })
    await flushPromises()

    expect(wrapper.find('.kb-reviews').exists()).toBe(false)
  })
})
