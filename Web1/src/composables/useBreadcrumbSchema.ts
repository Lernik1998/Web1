import { watchEffect, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'
import { SITE_ORIGIN } from './useSeoMeta'
import type { BreadcrumbItem } from '../components/Breadcrumbs.vue'

const SCRIPT_ID = 'kb-breadcrumb-schema'

/**
 * Igual patrón que useFaqSchema.ts/usePersonSchema.ts: inyecta/retira su
 * propio <script type="application/ld+json"> con BreadcrumbList.
 *
 * Debe reflejar exactamente el mismo breadcrumb visible en la página (ver
 * Breadcrumbs.vue) -- Google puede ignorar datos estructurados que describan
 * algo que no está también a la vista para un visitante humano.
 */
export function useBreadcrumbSchema(items: MaybeRefOrGetter<BreadcrumbItem[] | null | undefined>) {
  watchEffect(() => {
    const list = toValue(items)
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (!list || list.length === 0) {
      script?.remove()
      return
    }

    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: list.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${SITE_ORIGIN}${item.path}`,
      })),
    })
  })

  onUnmounted(() => {
    document.getElementById(SCRIPT_ID)?.remove()
  })
}
