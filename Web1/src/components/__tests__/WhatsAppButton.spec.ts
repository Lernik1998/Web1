import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

function clearAllCookies() {
  document.cookie.split('; ').forEach((pair) => {
    const name = pair.split('=')[0]
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  })
}

// useCookieConsent guarda su estado en una variable de módulo (singleton):
// hay que resetear los módulos y montar el componente tras importar de
// nuevo para que cada test empiece con `bannerVisible` en `false`.
async function mountWhatsAppButton() {
  vi.resetModules()
  const { default: WhatsAppButton } = await import('../WhatsAppButton.vue')
  return mount(WhatsAppButton)
}

describe('WhatsAppButton', () => {
  beforeEach(() => {
    clearAllCookies()
  })

  it('links to wa.me with the real phone number and a friendly prefilled message', async () => {
    const wrapper = await mountWhatsAppButton()

    const link = wrapper.get('a')
    expect(link.attributes('href')).toMatch(/^https:\/\/wa\.me\/34629538062\?text=/)
    expect(decodeURIComponent(link.attributes('href')!)).toContain(
      'me gustaría más información sobre las terapias',
    )
  })

  it('opens in a new tab safely', async () => {
    const wrapper = await mountWhatsAppButton()

    const link = wrapper.get('a')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
    expect(link.attributes('rel')).toContain('noreferrer')
  })

  it('has an accessible label', async () => {
    const wrapper = await mountWhatsAppButton()
    expect(wrapper.get('a').attributes('aria-label')).toMatch(/whatsapp/i)
  })

  it('is visible by default (banner not open)', async () => {
    const wrapper = await mountWhatsAppButton()
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('hides itself while the cookie banner is open, so it cannot be covered by it on mobile', async () => {
    vi.resetModules()
    const { useCookieConsent } = await import('../../composables/useCookieConsent')
    const { default: WhatsAppButton } = await import('../WhatsAppButton.vue')

    const { showBanner, hideBanner } = useCookieConsent()
    showBanner()

    const wrapper = mount(WhatsAppButton)
    expect(wrapper.find('a').exists()).toBe(false)

    hideBanner()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('a').exists()).toBe(true)
  })
})
