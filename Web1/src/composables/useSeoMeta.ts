import { watchEffect, toValue, type MaybeRefOrGetter } from 'vue'
import { useRoute } from 'vue-router'
import type { YoastHeadJson } from '../types/api'

export const SITE_NAME = 'Kanbouri Psicología'
export const SITE_ORIGIN = 'https://kanbouripsicologia.com'
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/images/logo_kanbouri_2023.png`

export interface SeoMetaInput {
  /**
   * Título ya completo, tal cual, sin añadirle nada más -- el título real
   * que el equipo del centro ha escrito en Yoast SEO en WordPress
   * (`yoast_head_json.title`) para esa página en concreto, que ya incluye
   * su propio sufijo de marca. Tiene prioridad sobre `title`/`siteName` si
   * se indican ambos.
   */
  fullTitle?: string
  /** Sin el sufijo del sitio: se añade automáticamente (" | Kanbouri Psicología"). Se ignora si se usa `fullTitle`. */
  title?: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  /** Páginas que no deben indexarse (404, formularios internos...). */
  noindex?: boolean
  /**
   * Sustituye "Kanbouri Psicología" como sufijo del <title> (y de
   * og:title/twitter:title) en esta página en concreto. Solo aplica cuando
   * se usa `title` (no `fullTitle`, que ya viene completo). `og:site_name`
   * no cambia: representa el sitio en su conjunto, no el título de cada
   * página.
   */
  siteName?: string
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
 * A partir de `yoast_head_json` (ya escrito a mano en WordPress con Yoast
 * SEO), da el `fullTitle`/`description` listos para `useSeoMeta`. Si en
 * Yoast no se ha rellenado a mano una meta-descripción específica para esa
 * página, el campo `description` viene vacío -- se usa `og_description`
 * (que Yoast sí genera siempre, aunque sea a partir del extracto) en su
 * lugar, en vez de no mostrar descripción ninguna. `null` si ni siquiera
 * hay título (datos aún no cargados, o página sin ficha de Yoast).
 */
export function seoMetaFromYoast(
  yoast: YoastHeadJson | null | undefined,
): Pick<SeoMetaInput, 'fullTitle' | 'description'> | null {
  const description = yoast?.description || yoast?.og_description
  if (!yoast?.title || !description) return null
  return { fullTitle: yoast.title, description }
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
    if (!meta || !(meta.fullTitle || meta.title) || !meta.description) return

    const fullTitle = meta.fullTitle ?? `${meta.title} | ${meta.siteName ?? SITE_NAME}`
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
