import { computed, reactive } from 'vue'
import { getCookie, setCookie, deleteCookie } from '../utils/cookies'
import { applyStatisticsConsent, applyMarketingConsent } from '../utils/consentScripts'

export const COOKIE_NAME = 'kanbouri_cookie_consent'
const COOKIE_MAX_AGE_DAYS = 365

export type ConsentCategory = 'statistics' | 'marketing'

export interface CookieConsentValue {
  functional: true
  statistics: boolean
  marketing: boolean
  updatedAt: string
}

export interface ConsentSelection {
  statistics: boolean
  marketing: boolean
}

function readStoredConsent(): CookieConsentValue | null {
  const raw = getCookie(COOKIE_NAME)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentValue>
    return {
      functional: true,
      statistics: parsed.statistics === true,
      marketing: parsed.marketing === true,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    }
  } catch (err) {
    console.error('Error reading cookie consent:', err)
    return null
  }
}

function applySideEffects(consent: CookieConsentValue): void {
  applyStatisticsConsent(consent.statistics)
  applyMarketingConsent(consent.marketing)
}

// Estado compartido (singleton): todas las llamadas a useCookieConsent() en
// toda la app leen/escriben el mismo estado reactivo, en vez de una copia
// local por componente.
const state = reactive<{ consent: CookieConsentValue | null }>({
  consent: readStoredConsent(),
})

// Al cargar la app, si ya existe la cookie de una visita anterior, hay que
// volver a aplicar sus efectos (cargar GA si tocaba, barrer cookies si no).
if (state.consent) {
  applySideEffects(state.consent)
}

function persist(consent: CookieConsentValue): void {
  state.consent = consent
  setCookie(COOKIE_NAME, JSON.stringify(consent), COOKIE_MAX_AGE_DAYS)
  applySideEffects(consent)
}

export function useCookieConsent() {
  const consent = computed(() => state.consent)
  const hasDecided = computed(() => state.consent !== null)

  function isAllowed(category: ConsentCategory): boolean {
    return state.consent?.[category] === true
  }

  function acceptAll(): void {
    persist({
      functional: true,
      statistics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    })
  }

  function rejectAll(): void {
    persist({
      functional: true,
      statistics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
    })
  }

  function savePreferences(selection: ConsentSelection): void {
    persist({
      functional: true,
      statistics: selection.statistics === true,
      marketing: selection.marketing === true,
      updatedAt: new Date().toISOString(),
    })
  }

  /** Solo para pruebas/depuración: borra la cookie y vuelve a pedir consentimiento. */
  function resetConsent(): void {
    deleteCookie(COOKIE_NAME)
    state.consent = null
    applyStatisticsConsent(false)
    applyMarketingConsent(false)
  }

  return {
    consent,
    hasDecided,
    isAllowed,
    acceptAll,
    rejectAll,
    savePreferences,
    resetConsent,
  }
}
