import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import Hero from '../Hero.vue'

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

describe('Hero', () => {
  it('renders title, button text and image from props', () => {
    const wrapper = mount(Hero, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
      props: {
        title: 'Terapia psicologica en Denia',
        description: 'Primer parrafo de la descripcion.',
        imageUrl: '/images/hero.jpg',
        buttonText: 'Pedir cita',
      },
    })

    expect(wrapper.text()).toContain('Terapia psicologica en Denia')
    expect(wrapper.text()).toContain('Primer parrafo de la descripcion.')
    expect(wrapper.text()).toContain('Pedir cita')

    const img = wrapper.find('img.kb-hero__image')
    expect(img.attributes('src')).toBe('/images/hero.jpg')
    expect(img.attributes('alt')).toBe('Terapia psicologica en Denia')
  })

  it('splits the description into multiple paragraphs on blank lines', () => {
    const wrapper = mount(Hero, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
      props: {
        title: 'Titulo',
        description: 'Primer parrafo.\n\nSegundo parrafo.',
        imageUrl: '/images/hero.jpg',
        buttonText: 'Pedir cita',
      },
    })

    const paragraphs = wrapper.findAll('.kb-hero__lead')
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]!.text()).toBe('Primer parrafo.')
    expect(paragraphs[1]!.text()).toBe('Segundo parrafo.')
  })

  it('links the CTA to /pedir-cita', () => {
    const wrapper = mount(Hero, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
      props: {
        title: 'Titulo',
        description: 'Descripcion',
        imageUrl: '/images/hero.jpg',
        buttonText: 'Pedir cita',
      },
    })

    const cta = wrapper.findComponent(RouterLinkStub)
    expect(cta.props('to')).toBe('/pedir-cita')
    expect(cta.classes()).toContain('kb-hero__cta')
  })
})
