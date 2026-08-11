#!/usr/bin/env node
/**
 * Genera public/sitemap.xml a partir de las rutas estáticas de la SPA más
 * el contenido dinámico real de WordPress (artículos del blog y fichas de
 * profesionales), consultando la misma API que usa la propia web.
 *
 * Al ser una SPA sin renderizado en servidor, un rastreador no puede
 * "descubrir" las rutas navegando enlaces internos con la misma facilidad
 * que en un sitio tradicional; el sitemap se lo pone en bandeja.
 *
 * Se ejecuta antes de cada build (ver "prebuild" en package.json), así que
 * el sitemap publicado siempre refleja los artículos/profesionales que
 * existan en WordPress en el momento del despliegue.
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_ORIGIN = 'https://kanbouripsicologia.com'
const API_BASE_URL = process.env.VITE_API_BASE_URL || SITE_ORIGIN
const OUTPUT_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public/sitemap.xml',
)

// Rutas que no dependen de contenido dinámico. `priority`/`changefreq` son
// solo pistas para el rastreador, no una garantía de posicionamiento.
// `yoast`, si se indica, es de dónde consultar si Yoast marca esa página
// como "No indexar" en WordPress -- ver `isNoindexInYoast()` más abajo. Las
// rutas sin `yoast` (los listados de /equipo y /blog, y los "hub" de
// /terapias/adultos, que no tienen ficha propia en WordPress) se incluyen
// siempre.
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0', yoast: { endpoint: 'pages', slug: 'home' } },
  {
    path: '/sobre-mi',
    changefreq: 'monthly',
    priority: '0.6',
    yoast: { endpoint: 'pages', slug: 'about-me' },
  },
  { path: '/equipo', changefreq: 'monthly', priority: '0.7' },
  {
    path: '/terapias/infantil',
    changefreq: 'monthly',
    priority: '0.9',
    yoast: { endpoint: 'therapie', slug: 'psicologia-infantil' },
  },
  {
    path: '/terapias/adolescentes',
    changefreq: 'monthly',
    priority: '0.9',
    yoast: { endpoint: 'therapie', slug: 'psicologia-para-adolescentes' },
  },
  { path: '/terapias/adultos', changefreq: 'monthly', priority: '0.9' },
  {
    path: '/terapias/adultos/ansiedad',
    changefreq: 'monthly',
    priority: '0.8',
    yoast: { endpoint: 'therapie', slug: 'ansiedad' },
  },
  {
    path: '/terapias/adultos/depresion',
    changefreq: 'monthly',
    priority: '0.8',
    yoast: { endpoint: 'therapie', slug: 'depresion-y-estado-de-animo' },
  },
  {
    path: '/terapias/adultos/autoestima',
    changefreq: 'monthly',
    priority: '0.8',
    yoast: { endpoint: 'therapie', slug: 'autoestima-y-desarrollo-personal' },
  },
  {
    path: '/terapias/adultos/duelo',
    changefreq: 'monthly',
    priority: '0.8',
    yoast: { endpoint: 'therapie', slug: 'duelo-y-perdidas' },
  },
  {
    path: '/terapias/padres-familia',
    changefreq: 'monthly',
    priority: '0.9',
    yoast: { endpoint: 'therapie', slug: 'psicologia-para-padres-y-familia' },
  },
  {
    path: '/para-psicologos',
    changefreq: 'monthly',
    priority: '0.5',
    yoast: { endpoint: 'pages', slug: 'for-psychologists' },
  },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  {
    path: '/pedir-cita',
    changefreq: 'monthly',
    priority: '0.9',
    yoast: { endpoint: 'pages', slug: 'form-appointment' },
  },
  {
    path: '/politica-privacidad',
    changefreq: 'yearly',
    priority: '0.1',
    yoast: { endpoint: 'pages', slug: 'politica-privacidad' },
  },
  {
    path: '/aviso-legal',
    changefreq: 'yearly',
    priority: '0.1',
    yoast: { endpoint: 'pages', slug: 'aviso-legal' },
  },
  {
    path: '/politica-cookies',
    changefreq: 'yearly',
    priority: '0.1',
    yoast: { endpoint: 'pages', slug: 'politica-de-cookies-ue' },
  },
]

// Un sitemap solo debe listar URLs indexables: si Yoast marca una página
// como "No indexar" (p. ej. las legales y, ahora mismo, todos los
// artículos del blog) pero el sitemap la sigue anunciando, es una señal
// contradictoria para los buscadores. `true` también ante cualquier fallo
// de red (más seguro excluir una URL de más que anunciar como indexable
// algo que no se ha podido comprobar).
async function isNoindexInYoast(endpoint, slug) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/wp-json/wp/v2/${endpoint}?slug=${slug}&_fields=yoast_head_json.robots`,
    )
    if (!response.ok) return true
    const [entry] = await response.json()
    return entry?.yoast_head_json?.robots?.index === 'noindex'
  } catch (err) {
    console.warn(`No se pudo comprobar el estado de indexación de "${slug}", se excluye por seguridad:`, err.message)
    return true
  }
}

async function fetchAllPages(endpoint) {
  const items = []
  let page = 1
  // WordPress corta en la última página con un 400; es la señal de parada.
  for (;;) {
    const response = await fetch(`${API_BASE_URL}${endpoint}&page=${page}`)
    if (!response.ok) break
    const batch = await response.json()
    if (!Array.isArray(batch) || batch.length === 0) break
    items.push(...batch)
    page += 1
  }
  return items
}

// Debe coincidir con el `perPage` de fetchBlogPosts() en src/services/dataService.ts:
// determina cuántas páginas "/blog/pagina/N" existen de verdad.
const BLOG_POSTS_PER_PAGE = 3

async function fetchDynamicRoutes() {
  const dynamicRoutes = []

  try {
    const posts = await fetchAllPages(
      '/wp-json/wp/v2/posts?per_page=50&_fields=slug,modified,yoast_head_json.robots',
    )
    // Ahora mismo TODOS los artículos están marcados "No indexar" en Yoast
    // (parece un ajuste global del tipo de contenido, no por artículo): se
    // respeta aquí igual que en la propia SPA (ver seoMetaFromYoast en
    // src/composables/useSeoMeta.ts) -- un sitemap no debe anunciar como
    // indexable algo que Yoast dice que no lo es.
    for (const post of posts) {
      if (post.yoast_head_json?.robots?.index === 'noindex') continue
      dynamicRoutes.push({
        path: `/blog/${post.slug}`,
        lastmod: post.modified,
        changefreq: 'monthly',
        priority: '0.6',
      })
    }

    // La página 1 ("/blog") ya está en STATIC_ROUTES. El resto de páginas
    // del listado también son URLs reales y navegables (ver BlogView.vue),
    // así que deben estar en el sitemap igual que cualquier otra ruta --
    // el recuento de páginas es sobre TODOS los artículos (indexables o
    // no), ya que la propia página de listado no está marcada noindex.
    const totalBlogPages = Math.ceil(posts.length / BLOG_POSTS_PER_PAGE)
    for (let page = 2; page <= totalBlogPages; page++) {
      dynamicRoutes.push({
        path: `/blog/pagina/${page}`,
        changefreq: 'weekly',
        priority: '0.4',
      })
    }
  } catch (err) {
    console.warn('No se pudieron obtener los artículos del blog para el sitemap:', err.message)
  }

  try {
    const professionals = await fetchAllPages(
      '/wp-json/wp/v2/profesional?per_page=50&_fields=slug,modified,yoast_head_json.robots',
    )
    for (const person of professionals) {
      if (person.yoast_head_json?.robots?.index === 'noindex') continue
      dynamicRoutes.push({
        path: `/equipo/${person.slug}`,
        lastmod: person.modified,
        changefreq: 'monthly',
        priority: '0.5',
      })
    }
  } catch (err) {
    console.warn('No se pudieron obtener las fichas de equipo para el sitemap:', err.message)
  }

  return dynamicRoutes
}

function buildXml(routes) {
  const urls = routes
    .map((route) => {
      const loc = `${SITE_ORIGIN}${route.path}`
      const lastmod = route.lastmod ? `\n    <lastmod>${route.lastmod.slice(0, 10)}</lastmod>` : ''
      return `  <url>
    <loc>${loc}</loc>${lastmod}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

async function main() {
  const staticRoutesChecks = await Promise.all(
    STATIC_ROUTES.map(async (route) => {
      if (!route.yoast) return true
      return !(await isNoindexInYoast(route.yoast.endpoint, route.yoast.slug))
    }),
  )
  const indexableStaticRoutes = STATIC_ROUTES.filter((_route, index) => staticRoutesChecks[index])

  const dynamicRoutes = await fetchDynamicRoutes()
  const xml = buildXml([...indexableStaticRoutes, ...dynamicRoutes])
  await writeFile(OUTPUT_PATH, xml, 'utf-8')
  const excluded = STATIC_ROUTES.length - indexableStaticRoutes.length
  console.log(
    `✔ sitemap.xml generado con ${indexableStaticRoutes.length + dynamicRoutes.length} URLs (${dynamicRoutes.length} dinámicas` +
      (excluded > 0 ? `, ${excluded} fijas excluidas por "No indexar" en Yoast` : '') +
      `) en ${OUTPUT_PATH}`,
  )
}

main().catch((err) => {
  console.error('✘ Error generando el sitemap:', err)
  process.exit(1)
})
