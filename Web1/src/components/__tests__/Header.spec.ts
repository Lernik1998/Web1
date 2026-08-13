import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Header from '../Header.vue'

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

describe('Header', () => {
  it('renders the main navigation links', () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    expect(wrapper.text()).toContain('Inicio')
    expect(wrapper.text()).toContain('Sobre M')
    expect(wrapper.text()).toContain('Terapias')
    expect(wrapper.text()).toContain('Equipo')
    expect(wrapper.text()).toContain('Para psic')
    expect(wrapper.text()).toContain('Blog')
    expect(wrapper.text()).toContain('Pedir cita')
  })

  it('toggles the mobile menu open and closed with the burger button', async () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    const burger = wrapper.find('.kb-burger')
    const nav = wrapper.find('.kb-nav')

    expect(burger.classes()).not.toContain('is-active')
    expect(nav.classes()).not.toContain('kb-nav--open')
    expect(burger.attributes('aria-expanded')).toBe('false')

    await burger.trigger('click')

    expect(burger.classes()).toContain('is-active')
    expect(nav.classes()).toContain('kb-nav--open')
    expect(burger.attributes('aria-expanded')).toBe('true')

    await burger.trigger('click')

    expect(burger.classes()).not.toContain('is-active')
    expect(nav.classes()).not.toContain('kb-nav--open')
  })

  it('opens the "Terapias" dropdown when its trigger button is clicked', async () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    const trigger = wrapper.find('.kb-nav__link--trigger')
    const dropdown = wrapper.find('.kb-dropdown')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(dropdown.classes()).not.toContain('is-open')

    await trigger.trigger('click')

    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(dropdown.classes()).toContain('is-open')
  })

  it('renders the therapy dropdown items including the nested "adultos" submenu', () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    const text = wrapper.text()
    expect(text).toContain('Psicología Infantil')
    expect(text).toContain('Adolescentes')
    expect(text).toContain('Psicología para Adultos')
    expect(text).toContain('Padres y Familia')
    expect(text).toContain('Ansiedad')
    expect(text.toLowerCase()).toContain('depresi')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('opens and closes the nested "adultos" submenu via its chevron button', async () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    const submenuTrigger = wrapper.find('.kb-dropdown__chevron-btn')
    const submenuWrap = wrapper.find('.kb-submenu-wrap')

    expect(submenuTrigger.attributes('aria-expanded')).toBe('false')
    expect(submenuWrap.classes()).not.toContain('is-open')

    await submenuTrigger.trigger('click')
    expect(submenuTrigger.attributes('aria-expanded')).toBe('true')
    expect(submenuWrap.classes()).toContain('is-open')

    await submenuTrigger.trigger('click')
    expect(submenuTrigger.attributes('aria-expanded')).toBe('false')
  })

  it('navigates to /terapias/adultos when clicking the "Psicología para Adultos" label itself', () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    const adultosLink = wrapper
      .findAll('a')
      .find((link) => link.text().includes('Psicología para Adultos'))

    expect(adultosLink?.attributes('href')).toBe('/terapias/adultos')
  })

  it('opens the dropdown on mouseenter (desktop hover) and schedules a close on mouseleave', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Header, {
      global: { directives },
    })

    const item = wrapper.find('.kb-nav__item--dropdown')
    const dropdown = wrapper.find('.kb-dropdown')

    await item.trigger('mouseenter')
    expect(dropdown.classes()).toContain('is-open')

    await item.trigger('mouseleave')
    // still open until the close timer fires
    expect(dropdown.classes()).toContain('is-open')

    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()
    expect(dropdown.classes()).not.toContain('is-open')
  })

  it('does not open the dropdown on hover when the nav is in mobile (accordion) mode', async () => {
    vi.stubGlobal('innerWidth', 500)
    const wrapper = mount(Header, {
      global: { directives },
    })

    const item = wrapper.find('.kb-nav__item--dropdown')
    const dropdown = wrapper.find('.kb-dropdown')

    await item.trigger('mouseenter')
    expect(dropdown.classes()).not.toContain('is-open')
  })

  it('closes everything when Escape is pressed', async () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    await wrapper.find('.kb-nav__link--trigger').trigger('click')
    expect(wrapper.find('.kb-dropdown').classes()).toContain('is-open')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.kb-dropdown').classes()).not.toContain('is-open')
  })

  it('closes the mobile menu when the scrim is clicked', async () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    await wrapper.find('.kb-burger').trigger('click')
    expect(wrapper.find('.kb-nav').classes()).toContain('kb-nav--open')

    await wrapper.find('.kb-nav-scrim').trigger('click')
    expect(wrapper.find('.kb-nav').classes()).not.toContain('kb-nav--open')
  })

  it('adds the scrolled class past the threshold and removes it with hysteresis', async () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    expect(wrapper.find('header').classes()).not.toContain('kb-header--scrolled')

    Object.defineProperty(window, 'scrollY', { value: 40, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('header').classes()).toContain('kb-header--scrolled')

    // small oscillation shouldn't remove it (hysteresis)
    Object.defineProperty(window, 'scrollY', { value: 12, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('header').classes()).toContain('kb-header--scrolled')

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('header').classes()).not.toContain('kb-header--scrolled')
  })

  it('closes the mobile menu when a nav link is clicked', async () => {
    const wrapper = mount(Header, {
      global: { directives },
    })

    await wrapper.find('.kb-burger').trigger('click')
    expect(wrapper.find('.kb-nav').classes()).toContain('kb-nav--open')

    await wrapper.find('.kb-nav__link').trigger('click')
    expect(wrapper.find('.kb-nav').classes()).not.toContain('kb-nav--open')
  })

  it('cleans up its window listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(Header, {
      global: { directives },
    })

    wrapper.unmount()

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeSpy.mockRestore()
  })
})
