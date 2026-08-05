import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import type { CookieSettingPost } from '../../types/api'

vi.mock('../../services/dataService', () => ({
  fetchCookieSetting: vi.fn<() => Promise<CookieSettingPost | null>>(),
}))

const COOKIE_NAME = 'kanbouri_cookie_consent'

function clearAllCookies() {
  document.cookie.split('; ').forEach((pair) => {
    const name = pair.split('=')[0]
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  })
}

function setConsentCookie(value: Record<string, unknown>) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; path=/`
}

function getConsentCookieValue(): Record<string, unknown> | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return match?.[1] ? (JSON.parse(decodeURIComponent(match[1])) as Record<string, unknown>) : null
}

// El banner depende de useCookieConsent(), que guarda su estado en una
// variable de módulo (singleton). Para que cada test arranque limpio, como
// haría un reload real de página, se resetean los módulos y se importa todo
// de nuevo (componente + dataService mockeado) en cada test.
async function setup() {
  vi.resetModules()
  const dataService = await import('../../services/dataService')
  const { default: CookieConsent } = await import('../CookieConsent.vue')
  const fetchCookieSetting = vi.mocked(dataService.fetchCookieSetting)
  fetchCookieSetting.mockResolvedValue(null)
  return { CookieConsent, fetchCookieSetting }
}

async function mountBanner() {
  const { CookieConsent, fetchCookieSetting } = await setup()
  const wrapper = mount(CookieConsent, {
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
  await flushPromises()
  return { wrapper, fetchCookieSetting }
}

describe('CookieConsent', () => {
  beforeEach(() => {
    clearAllCookies()
    document.querySelectorAll('script[data-consent]').forEach((el) => el.remove())
  })

  it('shows the banner on first visit when there is no consent cookie', async () => {
    const { wrapper } = await mountBanner()
    expect(wrapper.text()).toContain('Usamos cookies')
    expect(wrapper.find('.kb-cookie-reopen').exists()).toBe(false)
  })

  it('renders the three legal links (cookies, privacidad, aviso legal)', async () => {
    const { wrapper } = await mountBanner()
    const links = wrapper.findAllComponents(RouterLinkStub)
    const linkTexts = links.map((link) => link.text().trim())
    expect(linkTexts).toContain('Política de cookies')
    expect(linkTexts).toContain('Política de privacidad')
    expect(linkTexts).toContain('Aviso Legal')
  })

  it('does not render a "Necesarias"/always-on category', async () => {
    const { wrapper } = await mountBanner()
    const personalizarBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Ver preferencias')
    await personalizarBtn!.trigger('click')

    expect(wrapper.text()).not.toContain('Necesarias')
    expect(wrapper.text()).not.toContain('Siempre activas')
  })

  it('does not show the banner when a consent cookie already exists', async () => {
    setConsentCookie({ functional: true, statistics: true, marketing: false, updatedAt: '2026-01-01T00:00:00.000Z' })
    const { wrapper } = await mountBanner()
    expect(wrapper.find('.kb-cookie').exists()).toBe(false)
    expect(wrapper.find('.kb-cookie-reopen').exists()).toBe(true)
  })

  it('accepting all sets functional, statistics and marketing to true in the consent cookie', async () => {
    const { wrapper } = await mountBanner()

    await wrapper.find('.kb-cookie__btn--primary').trigger('click')

    expect(wrapper.find('.kb-cookie').exists()).toBe(false)
    expect(getConsentCookieValue()).toMatchObject({ functional: true, statistics: true, marketing: true })
  })

  it('rejecting keeps only functional=true in the consent cookie', async () => {
    const { wrapper } = await mountBanner()

    const rejectBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Rechazar')
    await rejectBtn!.trigger('click')

    expect(wrapper.find('.kb-cookie').exists()).toBe(false)
    expect(getConsentCookieValue()).toMatchObject({ functional: true, statistics: false, marketing: false })
  })

  it('the close (X) button acts as a rejection', async () => {
    const { wrapper } = await mountBanner()

    await wrapper.find('.kb-cookie__close').trigger('click')

    expect(wrapper.find('.kb-cookie').exists()).toBe(false)
    expect(getConsentCookieValue()).toMatchObject({ functional: true, statistics: false, marketing: false })
  })

  it('lets the user customize individual categories and save only those choices', async () => {
    const { wrapper } = await mountBanner()

    const personalizarBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Ver preferencias')
    await personalizarBtn!.trigger('click')

    expect(wrapper.text()).toContain('Estadísticas')
    expect(wrapper.text()).toContain('Marketing')

    const toggles = wrapper.findAll('.kb-cookie__toggle')
    expect(toggles).toHaveLength(2)
    await toggles[0]!.trigger('click') // "Estadísticas"

    await wrapper.find('.kb-cookie__btn--primary').trigger('click') // "Guardar preferencias"

    expect(getConsentCookieValue()).toMatchObject({ functional: true, statistics: true, marketing: false })
  })

  it('never lets the "functional" category end up as anything but true', async () => {
    const { wrapper } = await mountBanner()
    await wrapper.find('.kb-cookie__btn--primary').trigger('click') // "Aceptar todas"
    expect(getConsentCookieValue()?.functional).toBe(true)
  })

  it('reopening the banner after a decision jumps straight into the preferences view', async () => {
    setConsentCookie({ functional: true, statistics: false, marketing: false, updatedAt: '2026-01-01T00:00:00.000Z' })
    const { wrapper } = await mountBanner()

    await wrapper.find('.kb-cookie-reopen').trigger('click')

    expect(wrapper.find('.kb-cookie').exists()).toBe(true)
    expect(wrapper.text()).toContain('Guardar preferencias')
  })

  it('uses the title, description and category text from the WordPress setting', async () => {
    const { CookieConsent, fetchCookieSetting } = await setup()
    fetchCookieSetting.mockResolvedValue({
      acf: {
        cookie_title: 'Título de prueba',
        cookie_description: 'Descripción de prueba.',
        functional_title: 'Funcional',
        functional_status: true,
        functional_description: 'No usado.',
        statistics_title: 'Estadísticas WP',
        statistics_description: 'Descripción estadísticas WP.',
        marketing_title: 'Marketing WP',
        marketing_description: 'Descripción marketing WP.',
        accept_button_label: 'Aceptar cookies',
        deny_button_label: 'Denegar',
        save_button_label: 'Guardar preferencias',
        cookies_policy_url: 'https://kanbouripsicologia.com/wp-json/wp/v2/pages?slug=politica-de-cookies-ue',
        privacy_policy_url: 'https://kanbouripsicologia.com/wp-json/wp/v2/pages?slug=politica-privacidad',
        legal_notice_url: 'https://kanbouripsicologia.com/wp-json/wp/v2/pages?slug=aviso-legal',
        cookie_banner_enabled: true,
      },
    } as CookieSettingPost)

    const wrapper = mount(CookieConsent, {
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Título de prueba')
    expect(wrapper.text()).toContain('Descripción de prueba.')
    expect(wrapper.text()).toContain('Aceptar cookies')
    expect(wrapper.text()).toContain('Denegar')

    const personalizarBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Ver preferencias')
    await personalizarBtn!.trigger('click')
    expect(wrapper.text()).toContain('Estadísticas WP')
    expect(wrapper.text()).toContain('Marketing WP')
  })

  it('hides the banner entirely when cookie_banner_enabled is false', async () => {
    const { CookieConsent, fetchCookieSetting } = await setup()
    fetchCookieSetting.mockResolvedValue({
      acf: {
        cookie_title: 'Usamos cookies',
        cookie_description: 'desc',
        functional_title: 'Funcional',
        functional_status: true,
        functional_description: '',
        statistics_title: 'Estadísticas',
        statistics_description: '',
        marketing_title: 'Marketing',
        marketing_description: '',
        accept_button_label: 'Aceptar',
        deny_button_label: 'Rechazar',
        save_button_label: 'Guardar',
        cookies_policy_url: '',
        privacy_policy_url: '',
        legal_notice_url: '',
        cookie_banner_enabled: false,
      },
    } as CookieSettingPost)

    const wrapper = mount(CookieConsent, {
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    await flushPromises()

    expect(wrapper.find('.kb-cookie').exists()).toBe(false)
    expect(wrapper.find('.kb-cookie-reopen').exists()).toBe(false)
  })
})
