import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setCookie, getCookie } from '../cookies'

function clearAllCookies() {
  document.cookie.split('; ').forEach((pair) => {
    const name = pair.split('=')[0]
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  })
}

function clearInjectedScripts() {
  document.querySelectorAll('script[data-consent]').forEach((el) => el.remove())
}

describe('consentScripts', () => {
  beforeEach(() => {
    clearAllCookies()
    clearInjectedScripts()
    delete (window as unknown as { dataLayer?: unknown }).dataLayer
    delete (window as unknown as { gtag?: unknown }).gtag
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    clearInjectedScripts()
  })

  describe('applyStatisticsConsent', () => {
    it('does not inject Google Analytics when there is no measurement id configured', async () => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')
      const { applyStatisticsConsent } = await import('../consentScripts')
      applyStatisticsConsent(true)
      expect(document.querySelectorAll('script[data-consent="statistics"]').length).toBe(0)
    })

    it('injects the Google Analytics scripts when allowed and a measurement id is configured', async () => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')
      const { applyStatisticsConsent } = await import('../consentScripts')

      applyStatisticsConsent(true)

      const scripts = document.querySelectorAll('script[data-consent="statistics"]')
      expect(scripts.length).toBe(2)
      const loader = Array.from(scripts).find((el) => el.getAttribute('src'))
      expect(loader?.getAttribute('src')).toContain('G-TEST123')
    })

    it('does not inject Google Analytics twice on repeated calls', async () => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')
      const { applyStatisticsConsent } = await import('../consentScripts')

      applyStatisticsConsent(true)
      applyStatisticsConsent(true)

      expect(document.querySelectorAll('script[data-consent="statistics"]').length).toBe(2)
    })

    it('removes injected scripts and purges _ga/sbjs_ cookies when not allowed', async () => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')
      const { applyStatisticsConsent } = await import('../consentScripts')

      applyStatisticsConsent(true)
      setCookie('_ga', 'GA1.2.111', 1)
      setCookie('_ga_ABC123', 'GS1.1.222', 1)
      setCookie('sbjs_session', 'data', 1)

      applyStatisticsConsent(false)

      expect(document.querySelectorAll('script[data-consent="statistics"]').length).toBe(0)
      expect(getCookie('_ga')).toBeNull()
      expect(getCookie('_ga_ABC123')).toBeNull()
      expect(getCookie('sbjs_session')).toBeNull()
    })

    it('purges _ga and sbjs_ cookies even if Google Analytics was never loaded (no measurement id)', async () => {
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')
      const { applyStatisticsConsent } = await import('../consentScripts')

      setCookie('_ga', 'GA1.2.111', 1)
      setCookie('sbjs_current', 'data', 1)

      applyStatisticsConsent(false)

      expect(getCookie('_ga')).toBeNull()
      expect(getCookie('sbjs_current')).toBeNull()
    })
  })

  describe('applyMarketingConsent', () => {
    it('removes marketing-tagged scripts and purges known marketing cookies when not allowed', async () => {
      const { applyMarketingConsent } = await import('../consentScripts')

      const fakePixelScript = document.createElement('script')
      fakePixelScript.dataset.consent = 'marketing'
      document.head.appendChild(fakePixelScript)
      setCookie('_fbp', 'fb.1.111', 1)
      setCookie('_fbc', 'fb.1.222', 1)
      setCookie('_gcl_au', 'gcl-value', 1)

      applyMarketingConsent(false)

      expect(document.querySelectorAll('script[data-consent="marketing"]').length).toBe(0)
      expect(getCookie('_fbp')).toBeNull()
      expect(getCookie('_fbc')).toBeNull()
      expect(getCookie('_gcl_au')).toBeNull()
    })

    it('does not remove existing marketing scripts/cookies when allowed', async () => {
      const { applyMarketingConsent } = await import('../consentScripts')

      const fakePixelScript = document.createElement('script')
      fakePixelScript.dataset.consent = 'marketing'
      document.head.appendChild(fakePixelScript)
      setCookie('_fbp', 'fb.1.111', 1)

      applyMarketingConsent(true)

      expect(document.querySelectorAll('script[data-consent="marketing"]').length).toBe(1)
      expect(getCookie('_fbp')).toBe('fb.1.111')
    })
  })
})
