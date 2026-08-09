import type { Ref } from 'vue'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SITE_ORIGIN } from './useSeoMeta'

/**
 * Delega clicks dentro de un contenedor con contenido HTML de WordPress
 * (v-html) para que los enlaces internos naveguen con vue-router en vez de
 * recargar la página completa.
 *
 * `processWordPressContent` (ver utils/contentProcessor.ts) convierte
 * cualquier href relativo escrito a mano por un editor ("/pedir-cita") en
 * una URL absoluta ("https://kanbouripsicologia.com/pedir-cita") ANTES de
 * que este código vea el HTML -- solo los botones "wp-block-button" se
 * añaden después de ese paso y se libran de la conversión. Sin reconocer
 * también el propio origen del sitio como "interno", cualquier enlace
 * normal de texto escrito en el editor de WordPress hacía una recarga
 * completa de página en vez de una navegación SPA.
 */
export function useInternalLinks(containerRef: Ref<HTMLElement | null>) {
  const router = useRouter()

  function resolveInternalPath(href: string): string | null {
    if (href.startsWith('/')) return href
    if (href.startsWith(SITE_ORIGIN)) return href.slice(SITE_ORIGIN.length) || '/'
    return null
  }

  function handleClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const target = (event.target as HTMLElement).closest('a')
    // target="_blank" (o cualquier target explícito): debe abrirse como el
    // navegador decida, no interceptarse para navegar en la misma pestaña.
    if (!target || (target.getAttribute('target') && target.getAttribute('target') !== '_self')) return

    const href = target.getAttribute('href')
    if (!href) return
    const path = resolveInternalPath(href)
    if (path === null) return

    event.preventDefault()
    router.push(path)
  }

  onMounted(() => {
    containerRef.value?.addEventListener('click', handleClick)
  })

  onBeforeUnmount(() => {
    containerRef.value?.removeEventListener('click', handleClick)
  })

  watch(containerRef, (el, prevEl) => {
    prevEl?.removeEventListener('click', handleClick)
    el?.addEventListener('click', handleClick)
  })
}
