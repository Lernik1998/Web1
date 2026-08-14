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

  it('keeps a "|" separator in the title as real text, marked to be hidden visually, breaking the line in its place', () => {
    const wrapper = mount(Hero, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
      props: {
        title: 'Psicóloga en Dénia | Kanbouri Psicología',
        description: 'Descripcion',
        imageUrl: '/images/hero.jpg',
        buttonText: 'Pedir cita',
      },
    })

    const title = wrapper.find('.kb-hero__title')
    expect(title.text()).toContain('Psicóloga en Dénia')
    expect(title.text()).toContain('Kanbouri Psicología')
    // El "|" sigue como texto real dentro de un span con la clase que lo
    // oculta por CSS (.kb-hero__title-sep { display: none }) -- no se ha
    // quitado del HTML, solo no se pinta en pantalla.
    const sep = title.find('.kb-hero__title-sep')
    expect(sep.exists()).toBe(true)
    expect(sep.text()).toBe('|')
    expect(title.find('br').exists()).toBe(true)
  })

  it('renders the title as a single line when it has no "|" separator', () => {
    const wrapper = mount(Hero, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
      props: {
        title: 'Psicóloga en Dénia para adultos y parejas',
        description: 'Descripcion',
        imageUrl: '/images/hero.jpg',
        buttonText: 'Pedir cita',
      },
    })

    const title = wrapper.find('.kb-hero__title')
    expect(title.text()).toBe('Psicóloga en Dénia para adultos y parejas')
    expect(title.find('br').exists()).toBe(false)
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
