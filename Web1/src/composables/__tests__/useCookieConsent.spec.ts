import { describe, it, expect, beforeEach, vi } from 'vitest'

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

// El composable guarda su estado en una variable de módulo (singleton
// compartido por toda la app). Para que cada test empiece desde un estado
// limpio y predecible, se resetean los módulos y se importa de nuevo en
// cada `it`, tal y como haría un reload real de página.
async function loadComposable() {
  vi.resetModules()
  const mod = await import('../useCookieConsent')
  return mod.useCookieConsent()
}

describe('useCookieConsent', () => {
  beforeEach(() => {
    clearAllCookies()
    document.querySelectorAll('script[data-consent]').forEach((el) => el.remove())
  })

  it('has no consent decided on first visit (no cookie yet)', async () => {
    const { hasDecided, consent } = await loadComposable()
    expect(hasDecided.value).toBe(false)
    expect(consent.value).toBeNull()
  })

  it('reads an existing consent cookie on load', async () => {
    setConsentCookie({ functional: true, statistics: true, marketing: false, updatedAt: '2026-01-01T00:00:00.000Z' })
    const { hasDecided, consent, isAllowed } = await loadComposable()

    expect(hasDecided.value).toBe(true)
    expect(consent.value).toMatchObject({ functional: true, statistics: true, marketing: false })
    expect(isAllowed('statistics')).toBe(true)
    expect(isAllowed('marketing')).toBe(false)
  })

  it('acceptAll sets functional, statistics and marketing to true and persists the cookie', async () => {
    const { acceptAll, consent, hasDecided } = await loadComposable()

    acceptAll()

    expect(hasDecided.value).toBe(true)
    expect(consent.value).toMatchObject({ functional: true, statistics: true, marketing: true })
    expect(getConsentCookieValue()).toMatchObject({ functional: true, statistics: true, marketing: true })
  })

  it('rejectAll keeps only functional=true', async () => {
    const { rejectAll, consent } = await loadComposable()

    rejectAll()

    expect(consent.value).toMatchObject({ functional: true, statistics: false, marketing: false })
    expect(getConsentCookieValue()).toMatchObject({ functional: true, statistics: false, marketing: false })
  })

  it('savePreferences stores exactly the selection given, always forcing functional=true', async () => {
    const { savePreferences, consent } = await loadComposable()

    savePreferences({ statistics: true, marketing: false })

    expect(consent.value).toMatchObject({ functional: true, statistics: true, marketing: false })
    const stored = getConsentCookieValue()
    expect(stored).toMatchObject({ functional: true, statistics: true, marketing: false })
    expect(typeof stored?.updatedAt).toBe('string')
  })

  it('persists the consent as valid JSON with the exact shape required', async () => {
    const { acceptAll } = await loadComposable()
    acceptAll()

    const stored = getConsentCookieValue()
    expect(stored).toEqual({
      functional: true,
      statistics: true,
      marketing: true,
      updatedAt: expect.any(String),
    })
  })

  it('resetConsent removes the cookie so the banner would show again', async () => {
    const { acceptAll, resetConsent, hasDecided, consent } = await loadComposable()
    acceptAll()
    expect(hasDecided.value).toBe(true)

    resetConsent()

    expect(hasDecided.value).toBe(false)
    expect(consent.value).toBeNull()
    expect(getConsentCookieValue()).toBeNull()
  })

  it('starts with the banner already visible on a first visit (no consent decided yet)', async () => {
    const { bannerVisible } = await loadComposable()
    expect(bannerVisible.value).toBe(true)
  })

  it('starts with the banner hidden when consent was already decided in a previous visit', async () => {
    setConsentCookie({ statistics: true, marketing: false, updatedAt: new Date().toISOString() })
    const { bannerVisible } = await loadComposable()
    expect(bannerVisible.value).toBe(false)
  })

  it('showBanner/hideBanner toggle the shared banner visibility flag', async () => {
    const { bannerVisible, showBanner, hideBanner } = await loadComposable()

    showBanner()
    expect(bannerVisible.value).toBe(true)

    hideBanner()
    expect(bannerVisible.value).toBe(false)
  })

  it('shares banner visibility across every call to useCookieConsent() (singleton)', async () => {
    vi.resetModules()
    const { useCookieConsent } = await import('../useCookieConsent')
    const first = useCookieConsent()
    const second = useCookieConsent()

    first.showBanner()

    expect(second.bannerVisible.value).toBe(true)
  })

  it('shares state across every call to useCookieConsent() (singleton)', async () => {
    vi.resetModules()
    const { useCookieConsent } = await import('../useCookieConsent')
    const first = useCookieConsent()
    const second = useCookieConsent()

    first.acceptAll()

    expect(second.consent.value).toMatchObject({ statistics: true, marketing: true })
  })
})
