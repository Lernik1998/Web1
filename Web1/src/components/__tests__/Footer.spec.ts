import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import Footer from '../Footer.vue'

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

describe('Footer', () => {
  it('renders brand, contact info and legal links', () => {
    const wrapper = mount(Footer, {
      global: {
        directives,
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    expect(wrapper.text()).toContain('Kanbouri')
    expect(wrapper.text()).toContain('gabinete@kanbouripsicologia.com')
    expect(wrapper.text()).toContain('+34 629 538 062')
    expect(wrapper.text().toLowerCase()).toContain('privacidad')
    expect(wrapper.text()).toContain('Aviso legal')
    expect(wrapper.text().toLowerCase()).toContain('cookies')
  })

  it('renders the current year in the bottom bar', () => {
    const wrapper = mount(Footer, {
      global: {
        directives,
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    const year = new Date().getFullYear().toString()
    expect(wrapper.find('.footer-bottom').text()).toContain(year)
  })

  it('renders social links', () => {
    const wrapper = mount(Footer, {
      global: {
        directives,
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    expect(wrapper.find('a[aria-label="Facebook"]').exists()).toBe(true)
    expect(wrapper.find('a[aria-label="Instagram"]').exists()).toBe(true)
  })
})
