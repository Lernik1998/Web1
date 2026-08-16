import { deleteCookiesByPrefix } from './cookies'

/**
 * Puntos de entrada para activar/desactivar scripts y cookies de terceros
 * según el consentimiento de cada categoría. Todo pasa por aquí para que
 * "solo se cargue si hay consentimiento" sea una garantía en un único sitio,
 * no algo repartido por la app.
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let gaLoaded = false

/**
 * El bloque de configuración de gtag ("dataLayer + gtag('config', ...)")
 * tiene que ejecutarse como código normal de este módulo, NO como un
 * `<script>` inyectado con `textContent` (como se hacía antes): la CSP del
 * sitio (ver public/.htaccess e index.html) no lleva 'unsafe-inline' en
 * script-src a propósito, así que el navegador bloquea cualquier <script>
 * inline sin más -- Analytics se quedaba sin iniciar nunca, en silencio, sin
 * ningún error visible salvo un aviso de CSP en la consola. Solo el loader
 * externo (gtag/js, un script.src real) necesita seguir siendo un elemento
 * <script>, ya que ese dominio sí está permitido en script-src.
 */
function loadGoogleAnalytics(): void {
  if (gaLoaded || !GA_MEASUREMENT_ID) return

  const loader = document.createElement('script')
  loader.async = true
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  loader.dataset.consent = 'statistics'
  document.head.appendChild(loader)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID)

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
