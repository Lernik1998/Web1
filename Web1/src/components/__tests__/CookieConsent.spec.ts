import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import CookieConsent from '../CookieConsent.vue'

const STORAGE_KEY = 'kb-cookie-consent'

async function mountBanner() {
  const wrapper = mount(CookieConsent, {
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
  await flushPromises()
  return wrapper
}

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the banner on first visit when there is no stored consent', async () => {
    const wrapper = await mountBanner()
    expect(wrapper.text()).toContain('Usamos cookies')
    expect(wrapper.find('.kb-cookie-reopen').exists()).toBe(false)
  })

  it('does not show the banner when a consent decision is already stored', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ preferences: false, statistics: true, marketing: false }),
    )
    const wrapper = await mountBanner()
    expect(wrapper.find('.kb-cookie').exists()).toBe(false)
    expect(wrapper.find('.kb-cookie-reopen').exists()).toBe(true)
  })

  it('accepting all cookies hides the banner and persists every category as true', async () => {
    const wrapper = await mountBanner()

    await wrapper.find('.kb-cookie__btn--primary').trigger('click')

    expect(wrapper.find('.kb-cookie').exists()).toBe(false)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(stored).toMatchObject({ preferences: true, statistics: true, marketing: true })
  })

  it('rejecting persists every optional category as false', async () => {
    const wrapper = await mountBanner()

    const rejectBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text() === 'Rechazar')
    await rejectBtn!.trigger('click')

    expect(wrapper.find('.kb-cookie').exists()).toBe(false)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(stored).toMatchObject({ preferences: false, statistics: false, marketing: false })
  })

  it('the close (X) button acts as a rejection', async () => {
    const wrapper = await mountBanner()

    await wrapper.find('.kb-cookie__close').trigger('click')

    expect(wrapper.find('.kb-cookie').exists()).toBe(false)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(stored).toMatchObject({ preferences: false, statistics: false, marketing: false })
  })

  it('lets the user customize individual categories and save only those choices', async () => {
    const wrapper = await mountBanner()

    const personalizarBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text() === 'Personalizar')
    await personalizarBtn!.trigger('click')

    expect(wrapper.text()).toContain('Necesarias')
    expect(wrapper.text()).toContain('Siempre activas')
    expect(wrapper.text()).toContain('Estadísticas')

    const toggles = wrapper.findAll('.kb-cookie__toggle')
    expect(toggles).toHaveLength(3)
    await toggles[1]!.trigger('click') // "Estadísticas"

    await wrapper.find('.kb-cookie__btn--primary').trigger('click') // "Guardar preferencias"

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(stored).toMatchObject({ preferences: false, statistics: true, marketing: false })
  })

  it('reopening the banner after a decision jumps straight into the preferences view', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ preferences: false, statistics: false, marketing: false }),
    )
    const wrapper = await mountBanner()

    await wrapper.find('.kb-cookie-reopen').trigger('click')

    expect(wrapper.find('.kb-cookie').exists()).toBe(true)
    expect(wrapper.text()).toContain('Guardar preferencias')
  })
})
