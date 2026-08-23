import {
  fetchTherapieBySlug,
  fetchProfesionales,
  fetchProfesionalBySlug,
  fetchMediaById,
  fetchBlogPosts,
  fetchBlogPostBySlug,
  fetchHomePage,
  fetchAboutMePage,
  fetchForPsicologosPage,
  fetchPedirCitaPage,
  fetchAvisoLegalPage,
  fetchPoliticaPrivacidadPage,
  fetchPoliticaCookiesPage,
} from '../services/dataService'
import { ADULT_THERAPIES } from '../data/adultTherapies.mjs'

type RouteParams = Record<string, string | string[]>

// Los prefetch son "fire and forget": si fallan (red, WordPress caído un
// instante), la vista de destino hará su propia petición real al montarse y
// mostrará su manejo de error habitual -- esto nunca debe interrumpir la
// navegación ni mostrar nada por sí mismo.
function ignoreError(): void {
  // ver comentario de arriba
}

const adultTherapyPrefetch: Record<string, () => void> = Object.fromEntries(
  ADULT_THERAPIES.map((therapy) => [
    therapy.slug,
    () => {
      fetchTherapieBySlug(therapy.wpSlug).catch(ignoreError)
    },
  ]),
)

/**
 * Un prefetch por nombre de ruta (ver `src/router/index.ts`): dispara la
 * misma petición GET que la vista de destino haría en su `onMounted`, para
 * que -- gracias a la caché de peticiones de `services/api.ts` -- esa
 * petición ya esté resuelta cuando la navegación real ocurra y no llegue a
 * verse el estado de "Cargando". Solo hace falta acertar CUÁL petición hace
 * falta, no reproducir el procesado (ACF, título, etc.) de cada vista.
 */
const PREFETCH_BY_ROUTE_NAME: Record<string, (params: RouteParams) => void> = {
  home: () => {
    fetchHomePage().catch(ignoreError)
  },
  'sobre-mi': () => {
    fetchAboutMePage().catch(ignoreError)
  },
  equipo: () => {
    // La vista, tras el listado, pide también la foto de cada persona
    // (`hero_image`/`list_image`) -- se encadena aquí para que esa segunda
    // tanda de peticiones también esté resuelta, no solo el listado.
    fetchProfesionales()
      .then((professionals) => {
        const mediaIds = new Set<number>()
        professionals.forEach((post) => {
          if (post.acf.hero_image) mediaIds.add(post.acf.hero_image)
          if (post.acf.list_image) mediaIds.add(post.acf.list_image)
        })
        mediaIds.forEach((id) => {
          fetchMediaById(id).catch(ignoreError)
        })
      })
      .catch(ignoreError)
  },
  'team-member': (params) => {
    const slug = params.slug
    if (typeof slug !== 'string') return
    // La ficha, tras cargar a la persona, pide también su foto
    // (`hero_image`) -- se encadena aquí por la misma razón que en `equipo`.
    fetchProfesionalBySlug(slug)
      .then((profesional) => {
        const heroImage = profesional?.acf.hero_image
        if (heroImage) fetchMediaById(heroImage).catch(ignoreError)
      })
      .catch(ignoreError)
  },
  infantil: () => {
    fetchTherapieBySlug('psicologia-infantil').catch(ignoreError)
  },
  adolescentes: () => {
    fetchTherapieBySlug('psicologia-para-adolescentes').catch(ignoreError)
  },
  'padres-familia': () => {
    fetchTherapieBySlug('psicologia-para-padres-y-familia').catch(ignoreError)
  },
  ...adultTherapyPrefetch,
  'para-psicologos': () => {
    fetchForPsicologosPage().catch(ignoreError)
  },
  blog: () => {
    fetchBlogPosts(1).catch(ignoreError)
  },
  'blog-pagina': (params) => {
    const page = Number(params.page) || 1
    fetchBlogPosts(page).catch(ignoreError)
  },
  'blog-post': (params) => {
    const slug = params.slug
    if (typeof slug === 'string') fetchBlogPostBySlug(slug).catch(ignoreError)
  },
  'pedir-cita': () => {
    fetchPedirCitaPage().catch(ignoreError)
  },
  'politica-privacidad': () => {
    fetchPoliticaPrivacidadPage().catch(ignoreError)
  },
  'aviso-legal': () => {
    fetchAvisoLegalPage().catch(ignoreError)
  },
  'politica-cookies': () => {
    fetchPoliticaCookiesPage().catch(ignoreError)
  },
}

export function prefetchRoute(name: unknown, params: RouteParams): void {
  if (typeof name !== 'string') return
  PREFETCH_BY_ROUTE_NAME[name]?.(params)
}
