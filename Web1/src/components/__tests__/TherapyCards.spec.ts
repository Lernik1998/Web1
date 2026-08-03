import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import TherapyCards from '../TherapyCards.vue'

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

const cards = [
  {
    title: 'Psicologia infantil',
    description: 'Acompanamiento para los mas pequenos.',
    imageUrl: '/images/infantil.jpg',
    buttonText: 'Saber mas',
    href: '/terapias/infantil',
  },
  {
    title: 'Psicologia para adultos',
    description: 'Terapia para adultos en distintas etapas.',
    imageUrl: '/images/adultos.jpg',
    buttonText: 'Saber mas',
    href: '/terapias/adultos',
  },
]

describe('TherapyCards', () => {
  it('renders one card per item in the cards prop', () => {
    const wrapper = mount(TherapyCards, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
      props: { cards },
    })

    const rendered = wrapper.findAll('.kb-card')
    expect(rendered).toHaveLength(2)
  })

  it('renders title, description and image for each card', () => {
    const wrapper = mount(TherapyCards, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
      props: { cards },
    })

    expect(wrapper.text()).toContain('Psicologia infantil')
    expect(wrapper.text()).toContain('Acompanamiento para los mas pequenos.')

    const images = wrapper.findAll('img.kb-card__image')
    expect(images[0]!.attributes('src')).toBe('/images/infantil.jpg')
    expect(images[0]!.attributes('alt')).toBe('Psicologia infantil')
  })

  it('links each card to its href', () => {
    const wrapper = mount(TherapyCards, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
      props: { cards },
    })

    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links).toHaveLength(2)
    expect(links[0]!.props('to')).toBe('/terapias/infantil')
    expect(links[1]!.props('to')).toBe('/terapias/adultos')
  })
})
