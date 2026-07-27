import type { Ref } from 'vue'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Delega clicks dentro de un contenedor con contenido HTML de WordPress
 * (v-html) para que los enlaces internos (ej. los botones "wp-block-button"
 * con href="/pedir-cita") naveguen con vue-router en vez de recargar la
 * página completa.
 */
export function useInternalLinks(containerRef: Ref<HTMLElement | null>) {
  const router = useRouter()

  function handleClick(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest('a')
    if (!target) return

    const href = target.getAttribute('href')
    if (!href || !href.startsWith('/')) return

    event.preventDefault()
    router.push(href)
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
