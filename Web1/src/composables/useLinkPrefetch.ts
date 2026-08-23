import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { SITE_ORIGIN } from './useSeoMeta'
import { prefetchRoute } from '../router/prefetch'

/**
 * Precarga en segundo plano los datos de la página a la que apunta un
 * enlace interno, por dos vías:
 *
 * 1. En cuanto alguien muestra intención de ir ahí (ratón encima, foco por
 *    teclado, o el dedo tocando en móvil, que dispara antes que el propio
 *    click).
 * 2. En cuanto el enlace se hace visible en pantalla (sin esperar a que
 *    nadie interactúe con él) -- para el caso límite de un click
 *    prácticamente instantáneo, sin pasar antes el ratón por encima ni un
 *    segundo de por medio.
 *
 * Con cualquiera de las dos, para cuando la navegación real ocurra (con
 * router-link o un enlace dentro del contenido de WordPress) la petición a
 * la API ya está en marcha o resuelta, y la vista de destino no llega a
 * mostrar su estado de "Cargando" (ver la caché de peticiones en
 * `services/api.ts`, que es quien de verdad evita la petición duplicada).
 *
 * Delegación de eventos en `document` + un único `IntersectionObserver`
 * (en vez de algo por cada `<router-link>` o enlace suelto): cubre toda la
 * web -- header, migas de pan, tarjetas, contenido de WordPress
 * procesado, footer... -- sin tener que tocar cada componente que enlaza a
 * otra página. Un `MutationObserver` vuelve a rastrear el documento cada
 * vez que aparecen enlaces nuevos (cambio de ruta, contenido cargado de
 * forma asíncrona), para que el rastreo por visibilidad no se quede
 * limitado a los enlaces que ya existían al montar la app.
 *
 * El rastreo por visibilidad (la vía 2) espera a que el navegador esté
 * inactivo (`requestIdleCallback`) antes de arrancar: si empezara nada más
 * montar, sus peticiones -- potencialmente una por cada enlace visible en
 * pantalla -- competirían por las conexiones del navegador con las
 * peticiones de la propia página que se acaba de cargar, que son las que de
 * verdad importan para que el usuario vea contenido cuanto antes. La vía 1
 * (hover/foco/touch) no espera a nada: solo dispara cuando hay intención
 * real de navegar.
 */
export function useLinkPrefetch() {
  const router = useRouter()
  const alreadyPrefetched = new Set<string>()
  const observedLinks = new WeakSet<Element>()

  let intersectionObserver: IntersectionObserver | null = null
  let mutationObserver: MutationObserver | null = null

  function resolveInternalPath(href: string): string | null {
    if (href.startsWith('/')) return href
    if (href.startsWith(SITE_ORIGIN)) return href.slice(SITE_ORIGIN.length) || '/'
    return null
  }

  function tryPrefetch(path: string) {
    if (alreadyPrefetched.has(path)) return

    const resolved = router.resolve(path)
    if (resolved.name === undefined || resolved.name === 'not-found') return

    alreadyPrefetched.add(path)
    prefetchRoute(resolved.name, resolved.params as Record<string, string | string[]>)
  }

  function handleIntent(event: Event) {
    const target = event.target
    if (!(target instanceof Element)) return
    const link = target.closest('a[href]')
    const href = link?.getAttribute('href')
    if (!href) return

    const path = resolveInternalPath(href)
    if (path !== null) tryPrefetch(path)
  }

  function observeLink(link: Element) {
    if (observedLinks.has(link)) return
    observedLinks.add(link)
    intersectionObserver?.observe(link)
  }

  function scanForLinks() {
    document.querySelectorAll('a[href]').forEach(observeLink)
  }

  let idleHandle: number | null = null
  let idleIsRequestIdleCallback = false

  function setupVisibilityPrefetch() {
    // Todos los navegadores modernos soportan `IntersectionObserver`, pero
    // se comprueba igualmente: sin ello, esta parte (una mejora, no algo
    // imprescindible -- el hover/foco/touch de arriba ya cubre el caso
    // normal) rompería el montaje de toda la app en vez de degradarse sola.
    if (typeof IntersectionObserver === 'undefined') return

    intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        intersectionObserver?.unobserve(entry.target)
        const href = entry.target.getAttribute('href')
        const path = href ? resolveInternalPath(href) : null
        if (path !== null) tryPrefetch(path)
      }
    })

    mutationObserver = new MutationObserver(scanForLinks)
    mutationObserver.observe(document.body, { childList: true, subtree: true })
    scanForLinks()
  }

  onMounted(() => {
    // "mouseover" (con burbujeo) en vez de "mouseenter": así un único
    // listener en `document` sirve para cualquier enlace de la página sin
    // tener que registrar uno por elemento. "focusin" cubre la navegación
    // por teclado (Tab) y "touchstart" dispara antes que el click en
    // pantallas táctiles.
    document.addEventListener('mouseover', handleIntent, { passive: true })
    document.addEventListener('focusin', handleIntent, { passive: true })
    document.addEventListener('touchstart', handleIntent, { passive: true })

    // El rastreo por visibilidad espera a que el navegador esté inactivo
    // (`requestIdleCallback`) antes de arrancar: si empezara nada más
    // montar, sus peticiones (potencialmente una por cada enlace visible en
    // pantalla) competirían por las conexiones del navegador con las
    // peticiones de la propia página que se acaba de cargar -- justo las
    // que de verdad importan para que el usuario vea contenido cuanto
    // antes. `setTimeout` como respaldo en navegadores sin
    // `requestIdleCallback` (Safari).
    if (typeof requestIdleCallback === 'function') {
      idleIsRequestIdleCallback = true
      idleHandle = requestIdleCallback(setupVisibilityPrefetch, { timeout: 2000 })
    } else {
      idleHandle = window.setTimeout(setupVisibilityPrefetch, 500)
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mouseover', handleIntent)
    document.removeEventListener('focusin', handleIntent)
    document.removeEventListener('touchstart', handleIntent)

    if (idleHandle !== null) {
      if (idleIsRequestIdleCallback) cancelIdleCallback(idleHandle)
      else window.clearTimeout(idleHandle)
    }
    intersectionObserver?.disconnect()
    mutationObserver?.disconnect()
  })
}
