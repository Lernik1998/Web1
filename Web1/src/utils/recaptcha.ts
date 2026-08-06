declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

/**
 * Google reCAPTCHA v3 (sin fricción visual: se ejecuta en segundo plano y
 * da una puntuación 0–1 por acción). Sin `VITE_RECAPTCHA_SITE_KEY`
 * configurada, `getRecaptchaToken` no bloquea nada (devuelve `null`), igual
 * que Google Analytics sin `VITE_GA_MEASUREMENT_ID` en consentScripts.ts:
 * así el formulario sigue funcionando en desarrollo/tests sin credenciales.
 */
const RECAPTCHA_SCRIPT_ID = 'kb-recaptcha-script'

let scriptPromise: Promise<void> | null = null

function getSiteKey(): string | undefined {
  return import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined
}

function loadScript(siteKey: string): Promise<void> {
  if (window.grecaptcha) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    if (document.getElementById(RECAPTCHA_SCRIPT_ID)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id = RECAPTCHA_SCRIPT_ID
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar el script de reCAPTCHA.'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

/**
 * Devuelve un token de reCAPTCHA v3 para la acción indicada, listo para
 * enviarse junto con el formulario al backend (que debe verificarlo contra
 * la API `siteverify` de Google antes de aceptar la solicitud).
 *
 * - Sin site key configurada: devuelve `null` sin bloquear el envío.
 * - Con site key configurada pero fallo de carga/ejecución: relanza el
 *   error para que el formulario pueda bloquear el envío (fallar cerrado
 *   es preferible a dejar pasar un bot porque Google no respondió).
 */
export async function getRecaptchaToken(action: string): Promise<string | null> {
  const siteKey = getSiteKey()
  if (!siteKey) return null

  await loadScript(siteKey)

  if (!window.grecaptcha) {
    throw new Error('reCAPTCHA no está disponible.')
  }

  return new Promise<string>((resolve, reject) => {
    window.grecaptcha?.ready(() => {
      window
        .grecaptcha!.execute(siteKey, { action })
        .then(resolve)
        .catch(reject)
    })
  })
}
