import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '../../../router'
import AdultosView from '../AdultosView.vue'

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

describe('AdultosView', () => {
  beforeEach(async () => {
    router.push('/terapias/adultos')
    await router.isReady()
  })

  it('renders the static title, lead text and areas we work on', () => {
    const wrapper = mount(AdultosView, {
      global: { plugins: [router], directives },
    })

    expect(wrapper.text()).toContain('Psicóloga para adultos')
    expect(wrapper.text()).toContain('Áreas que trabajamos')
    expect(wrapper.text()).toContain('Ansiedad')
    expect(wrapper.text()).toContain('Depresión y estado de ánimo')
    expect(wrapper.text()).toContain('Autoestima y desarrollo personal')
    expect(wrapper.text()).toContain('Duelo y pérdidas')
  })

  it('renders a router-link pill for each area pointing to the right route', () => {
    const wrapper = mount(AdultosView, {
      global: { plugins: [router], directives },
    })

    const pills = wrapper.findAll('.kb-pill')
    expect(pills.length).toBe(4)

    const hrefs = pills.map((pill) => pill.attributes('href'))
    expect(hrefs).toContain('/terapias/adultos/ansiedad')
    expect(hrefs).toContain('/terapias/adultos/depresion')
    expect(hrefs).toContain('/terapias/adultos/autoestima')
    expect(hrefs).toContain('/terapias/adultos/duelo')
  })

  it('renders the "qué te llevas" benefits list and the FAQ block', () => {
    const wrapper = mount(AdultosView, {
      global: { plugins: [router], directives },
    })

    expect(wrapper.text()).toContain('Qué te llevas del proceso')
    expect(wrapper.text()).toContain('Mayor autoconocimiento')
    expect(wrapper.text()).toContain('Preguntas frecuentes')
    expect(wrapper.text()).toContain('¿Cuánto dura cada sesión?')
  })

  it('links the final CTA to the appointment form with the adultos query param', () => {
    const wrapper = mount(AdultosView, {
      global: { plugins: [router], directives },
    })

    const cta = wrapper.get('.kb-therapy__cta')
    expect(cta.text()).toContain('Pedir cita')
    expect(cta.attributes('href')).toBe('/pedir-cita?servicio=adultos')
  })
})
