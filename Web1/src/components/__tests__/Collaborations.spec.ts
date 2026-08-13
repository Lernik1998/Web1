import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Collaborations from '../Collaborations.vue'

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

describe('Collaborations', () => {
  it('renders the section title and all university cards', () => {
    const wrapper = mount(Collaborations, {
      global: { directives },
    })

    expect(wrapper.text()).toContain('Colaboramos Con')

    const cards = wrapper.findAll('.kb-collab__card')
    expect(cards).toHaveLength(4)

    const labels = cards.map((c) => c.attributes('aria-label'))
    expect(labels).toEqual(['UNIR', 'UNED', 'Universidad Isabel I', 'UNIE'])
  })

  it('links each card to its external href', () => {
    const wrapper = mount(Collaborations, {
      global: { directives },
    })

    const unir = wrapper.find('a[aria-label="UNIR"]')
    expect(unir.attributes('href')).toBe('https://www.unir.net/')
    expect(unir.attributes('target')).toBe('_blank')
  })
})
