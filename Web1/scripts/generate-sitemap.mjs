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
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/sobre-mi', changefreq: 'monthly', priority: '0.6' },
  { path: '/equipo', changefreq: 'monthly', priority: '0.7' },
  { path: '/terapias/infantil', changefreq: 'monthly', priority: '0.9' },
  { path: '/terapias/adolescentes', changefreq: 'monthly', priority: '0.9' },
  { path: '/terapias/adultos', changefreq: 'monthly', priority: '0.9' },
  { path: '/terapias/adultos/ansiedad', changefreq: 'monthly', priority: '0.8' },
  { path: '/terapias/adultos/depresion', changefreq: 'monthly', priority: '0.8' },
  { path: '/terapias/adultos/autoestima', changefreq: 'monthly', priority: '0.8' },
  { path: '/terapias/adultos/duelo', changefreq: 'monthly', priority: '0.8' },
  { path: '/terapias/padres-familia', changefreq: 'monthly', priority: '0.9' },
  { path: '/para-psicologos', changefreq: 'monthly', priority: '0.5' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  { path: '/pedir-cita', changefreq: 'monthly', priority: '0.9' },
  { path: '/politica-privacidad', changefreq: 'yearly', priority: '0.1' },
  { path: '/aviso-legal', changefreq: 'yearly', priority: '0.1' },
  { path: '/politica-cookies', changefreq: 'yearly', priority: '0.1' },
]

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

async function fetchDynamicRoutes() {
  const dynamicRoutes = []

  try {
    const posts = await fetchAllPages('/wp-json/wp/v2/posts?per_page=50&_fields=slug,modified')
    for (const post of posts) {
      dynamicRoutes.push({
        path: `/blog/${post.slug}`,
        lastmod: post.modified,
        changefreq: 'monthly',
        priority: '0.6',
      })
    }
  } catch (err) {
    console.warn('No se pudieron obtener los artículos del blog para el sitemap:', err.message)
  }

  try {
    const professionals = await fetchAllPages(
      '/wp-json/wp/v2/profesional?per_page=50&_fields=slug,modified',
    )
    for (const person of professionals) {
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
  const dynamicRoutes = await fetchDynamicRoutes()
  const xml = buildXml([...STATIC_ROUTES, ...dynamicRoutes])
  await writeFile(OUTPUT_PATH, xml, 'utf-8')
  console.log(
    `✔ sitemap.xml generado con ${STATIC_ROUTES.length + dynamicRoutes.length} URLs (${dynamicRoutes.length} dinámicas) en ${OUTPUT_PATH}`,
  )
}

main().catch((err) => {
  console.error('✘ Error generando el sitemap:', err)
  process.exit(1)
})
