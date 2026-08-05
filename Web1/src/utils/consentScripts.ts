import { deleteCookiesByPrefix } from './cookies'

/**
 * Puntos de entrada para activar/desactivar scripts y cookies de terceros
 * según el consentimiento de cada categoría. Todo pasa por aquí para que
 * "solo se cargue si hay consentimiento" sea una garantía en un único sitio,
 * no algo repartido por la app.
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

let gaLoaded = false

function loadGoogleAnalytics(): void {
  if (gaLoaded || !GA_MEASUREMENT_ID) return

  const loader = document.createElement('script')
  loader.async = true
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  loader.dataset.consent = 'statistics'
  document.head.appendChild(loader)

  const init = document.createElement('script')
  init.dataset.consent = 'statistics'
  init.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  `
  document.head.appendChild(init)

  gaLoaded = true
}

function unloadGoogleAnalytics(): void {
  document.querySelectorAll('script[data-consent="statistics"]').forEach((el) => el.remove())
  gaLoaded = false
  delete (window as unknown as { dataLayer?: unknown }).dataLayer
  delete (window as unknown as { gtag?: unknown }).gtag
}

/**
 * Estadísticas: Google Analytics (cookies `_ga`) y Sourcebuster (cookies
 * `sbjs_`, atribución de tráfico). Ninguna de las dos debe existir salvo que
 * `statistics === true`; si el usuario deniega o revoca, se retiran los
 * scripts y se barren las cookies que ya hubieran dejado.
 */
export function applyStatisticsConsent(allowed: boolean): void {
  if (allowed) {
    loadGoogleAnalytics()
    // Si en el futuro se añade el script de Sourcebuster, se debe cargar
    // aquí mismo (gateado por `allowed`), igual que Google Analytics.
  } else {
    unloadGoogleAnalytics()
    deleteCookiesByPrefix('_ga')
    deleteCookiesByPrefix('sbjs_')
  }
}

/**
 * Marketing: de momento no hay ningún script activo, pero Facebook Pixel,
 * Google Ads (o similares) deben colgarse de aquí, siguiendo el mismo patrón
 * que Google Analytics — creado solo si `allowed`, marcado con
 * `data-consent="marketing"` para poder retirarlo limpiamente si se revoca.
 */
export function applyMarketingConsent(allowed: boolean): void {
  if (!allowed) {
    document.querySelectorAll('script[data-consent="marketing"]').forEach((el) => el.remove())
    deleteCookiesByPrefix('_fbp')
    deleteCookiesByPrefix('_fbc')
    deleteCookiesByPrefix('_gcl')
  }
}
