import { watchEffect, toValue, type MaybeRefOrGetter } from 'vue'
import { useRoute } from 'vue-router'

export const SITE_NAME = 'Kanbouri Psicología'
export const SITE_ORIGIN = 'https://kanbouripsicologia.com'
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/images/logo_kanbouri_2023.png`

export interface SeoMetaInput {
  /** Sin el sufijo del sitio: se añade automáticamente (" | Kanbouri Psicología"). */
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  /** Páginas que no deben indexarse (404, formularios internos...). */
  noindex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Trunca en el último espacio antes del límite (no corta palabras a la
 * mitad), para que las meta-descripciones no se vean cortadas de forma fea
 * en los resultados de búsqueda.
 */
export function truncateForMeta(text: string, maxLength = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const cut = clean.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`
}

/**
 * Actualiza <title>, meta description, canonical y Open Graph/Twitter Card
 * para la ruta actual. Al ser una SPA sin renderizado en servidor, sin esto
 * TODAS las páginas comparten el único <title>/description de index.html
 * (malo para SEO por página y para las vistas previas al compartir enlaces
 * de artículos, terapias o perfiles concretos).
 *
 * `source` puede devolver `null`/`undefined` mientras los datos aún no han
 * llegado de la API: en ese caso no se toca nada (se deja el meta por
 * defecto de index.html) hasta que haya contenido real.
 */
export function useSeoMeta(source: MaybeRefOrGetter<SeoMetaInput | null | undefined>) {
  const route = useRoute()

  watchEffect(() => {
    const meta = toValue(source)
    if (!meta || !meta.title || !meta.description) return

    const fullTitle = `${meta.title} | ${SITE_NAME}`
    document.title = fullTitle

    upsertMeta('name', 'description', meta.description)
    upsertMeta(
      'name',
      'robots',
      meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    )

    const canonicalUrl = `${SITE_ORIGIN}${route.path}`
    upsertLink('canonical', canonicalUrl)

    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:type', meta.type ?? 'website')
    upsertMeta('property', 'og:image', meta.image || DEFAULT_OG_IMAGE)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:locale', 'es_ES')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', meta.description)
    upsertMeta('name', 'twitter:image', meta.image || DEFAULT_OG_IMAGE)
  })
}
