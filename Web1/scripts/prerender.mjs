#!/usr/bin/env node
/**
 * Pre-renderizado estático post-build: la SPA (Vue + vue-router en modo
 * history) no tiene SSR, así que el HTML que sale de `vite build` es casi
 * vacío ("<div id="app"></div>") hasta que el navegador ejecuta el JS y la
 * app pide los datos a la API de WordPress.
 *
 * Google normalmente ejecuta ese JS antes de indexar, pero muchos
 * rastreadores de asistentes de IA que citan fuentes (Perplexity, buscadores
 * con IA, etc.) leen el HTML tal cual, sin ejecutar JavaScript -- para ellos
 * la web estaría efectivamente vacía. Este script arregla eso sin cambiar la
 * arquitectura: después del build, abre cada ruta real del sitio en un
 * navegador headless (igual que un usuario), espera a que el contenido real
 * ya esté en el DOM, y guarda ese HTML ya completo como el `index.html` de
 * esa ruta dentro de `dist/`.
 *
 * El usuario real sigue recibiendo la misma SPA de siempre: el HTML
 * pre-renderizado solo sirve de "primer pintado" instantáneo (y de lo que
 * ve un rastreador sin JS); en cuanto carga el bundle, Vue toma el control
 * del mismo #app como en cualquier build normal.
 *
 * Requiere que `dist/` ya exista (se ejecuta como "postbuild", ver
 * package.json) y que los navegadores de Playwright estén instalados
 * (`npx playwright install chromium`, solo hace falta una vez por máquina).
 */
import { createServer } from 'node:http'
import { readFile, stat, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST_DIR = path.join(ROOT, 'dist')
const SITE_ORIGIN = 'https://kanbouripsicologia.com'
const API_BASE_URL = process.env.VITE_API_BASE_URL || SITE_ORIGIN
const PORT = 4173

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
}

// Mismas rutas que consume public/sitemap.xml (ver scripts/generate-sitemap.mjs):
// las estáticas de la SPA más el contenido dinámico real de WordPress.
const STATIC_ROUTES = [
  '/',
  '/sobre-mi',
  '/equipo',
  '/terapias/infantil',
  '/terapias/adolescentes',
  '/terapias/adultos',
  '/terapias/adultos/ansiedad',
  '/terapias/adultos/depresion',
  '/terapias/adultos/autoestima',
  '/terapias/adultos/duelo',
  '/terapias/padres-familia',
  '/para-psicologos',
  '/blog',
  '/pedir-cita',
  '/politica-privacidad',
  '/aviso-legal',
  '/politica-cookies',
]

async function fetchAllPages(endpoint) {
  const items = []
  let page = 1
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

// Debe coincidir con el `perPage` de fetchBlogPosts() en src/services/dataService.ts.
const BLOG_POSTS_PER_PAGE = 3

async function fetchDynamicRoutes() {
  const dynamicRoutes = []

  try {
    const posts = await fetchAllPages('/wp-json/wp/v2/posts?per_page=50&_fields=slug')
    posts.forEach((post) => dynamicRoutes.push(`/blog/${post.slug}`))

    // Igual que las fichas de artículo: cada página del listado ("/blog",
    // "/blog/pagina/2"...) es una ruta real y navegable (ver BlogView.vue),
    // así que también debe llegar a los rastreadores con su contenido ya
    // dentro, no solo la primera.
    const totalBlogPages = Math.ceil(posts.length / BLOG_POSTS_PER_PAGE)
    for (let page = 2; page <= totalBlogPages; page++) {
      dynamicRoutes.push(`/blog/pagina/${page}`)
    }
  } catch (err) {
    console.warn('No se pudieron obtener los artículos del blog para el pre-renderizado:', err.message)
  }

  try {
    const professionals = await fetchAllPages('/wp-json/wp/v2/profesional?per_page=50&_fields=slug')
    professionals.forEach((person) => dynamicRoutes.push(`/equipo/${person.slug}`))
  } catch (err) {
    console.warn('No se pudieron obtener las fichas de equipo para el pre-renderizado:', err.message)
  }

  return dynamicRoutes
}

// Servidor estático mínimo con el mismo fallback a index.html que usa
// public/.htaccess en producción (mod_rewrite): sirve el archivo si existe,
// si no, index.html, para que vue-router resuelva la ruta al navegar
// directamente a ella (igual que haría un usuario o un rastreador real).
function startServer() {
  const server = createServer(async (req, res) => {
    const requestPath = decodeURIComponent(req.url.split('?')[0])
    let filePath = path.join(DIST_DIR, requestPath)

    try {
      const stats = await stat(filePath)
      if (stats.isDirectory()) filePath = path.join(filePath, 'index.html')
    } catch {
      // app-shell.html, no index.html: en cuanto se pre-renderiza "/" (la
      // primera ruta de la lista), dist/index.html pasa a ser el HTML ya
      // completo de la portada -- si este fallback lo usara, cada ruta
      // siguiente arrancaría montando Vue encima del DOM de la portada en
      // vez de sobre el shell vacío real que usará producción (ver
      // public/.htaccess). Da igual, Vue lo reemplaza igualmente, pero así
      // el crawl reproduce exactamente el comportamiento real de Apache.
      filePath = path.join(DIST_DIR, 'app-shell.html')
    }

    try {
      const content = await readFile(filePath)
      const ext = path.extname(filePath)
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
      res.end(content)
    } catch {
      res.writeHead(404)
      res.end('Not found')
    }
  })

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server))
  })
}

async function prerenderRoute(browser, route) {
  const page = await browser.newPage()
  try {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle' })
    // Señal de que la app ya renderizó datos reales (no solo el spinner de
    // carga): espera a que exista contenido de texto real en la página.
    await page.waitForFunction(
      () => (document.querySelector('main, article, h1')?.textContent?.trim().length ?? 0) > 0,
      { timeout: 10_000 },
    )
    // Los chunks de rutas cargadas de forma perezosa (vue-router
    // `() => import(...)`) resuelven su URL contra `import.meta.url` en
    // tiempo de ejecución, así que el navegador los inyecta en el DOM como
    // <script>/<link> con la URL ABSOLUTA del servidor local usado aquí
    // (http://localhost:4173/assets/...) en vez de la ruta relativa
    // original. Sin este reemplazo, el HTML guardado apuntaría a
    // localhost:4173 también en producción, y esos chunks no cargarían.
    let html = (await page.content()).replaceAll(`http://localhost:${PORT}`, '')

    // Vistas migradas a useHydratedAsync() (ver src/composables/useHydratedAsync.ts)
    // registran aquí los datos que acaban de pedir a la API: se incrustan en
    // el propio HTML para que el cliente real no tenga que volver a pedirlos
    // y así evitar el salto de layout de "cargando → contenido".
    const captured = await page.evaluate(() => window.__KB_HYDRATION_CAPTURE__ ?? null)
    if (captured && Object.keys(captured).length > 0) {
      const json = JSON.stringify(captured).replace(/</g, '\\u003c')
      html = html.replace(
        '</body>',
        `<script id="kb-hydration-data" type="application/json">${json}</script></body>`,
      )
    }

    const outDir = route === '/' ? DIST_DIR : path.join(DIST_DIR, route)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), html, 'utf-8')
    console.log(`  ✔ ${route}`)
  } catch (err) {
    console.warn(`  ✘ ${route}: ${err.message}`)
  } finally {
    await page.close()
  }
}

// Las tipografías (@fontsource, ver src/main.ts) solo se descubren cuando el
// navegador procesa el CSS que las declara (@font-face), que a su vez solo
// llega tras descargar y ejecutar el bundle -- por eso, con "font-display:
// swap", el texto se pinta primero con la fuente de repuesto del sistema y
// salta de tamaño al cambiar a la real varios cientos de ms después,
// provocando un salto de layout medible (confirmado con CPU limitada, y con
// el propio "cls-culprits-insight" de Lighthouse señalando explícitamente
// "Web font" como causa). Precargar aquí los pesos que se usan por encima
// del pliegue en (casi) cualquier página -- Inter 400 (cuerpo), Inter 500
// (botones/enlaces "text-cta"), Fraunces 600 (títulos h1/h2) y Fraunces
// 400 cursiva (citas y texto de presentación, p. ej. AboutView.vue) --
// adelanta esa descarga al principio del todo, antes de que el texto
// llegue a pintarse. Solo el subset "latin" (cubre también los caracteres
// con tilde/ñ del español; "latin-ext" es para otros alfabetos que esta
// web no usa).
const FONT_PRELOAD_PATTERNS = [
  /^inter-latin-400-normal-.*\.woff2$/,
  /^inter-latin-500-normal-.*\.woff2$/,
  /^fraunces-latin-600-normal-.*\.woff2$/,
  /^fraunces-latin-400-italic-.*\.woff2$/,
]

async function injectFontPreloads(htmlPath) {
  const assetsDir = path.join(DIST_DIR, 'assets')
  const files = await readdir(assetsDir)
  const toPreload = files.filter((file) => FONT_PRELOAD_PATTERNS.some((pattern) => pattern.test(file)))

  if (toPreload.length === 0) {
    console.warn('  ⚠ No se encontraron los archivos de fuente esperados para precargar.')
    return
  }

  const links = toPreload
    .map((file) => `    <link rel="preload" as="font" type="font/woff2" href="/assets/${file}" crossorigin>`)
    .join('\n')

  const html = await readFile(htmlPath, 'utf-8')
  await writeFile(htmlPath, html.replace('</head>', `${links}\n  </head>`), 'utf-8')
}

async function main() {
  try {
    await stat(DIST_DIR)
  } catch {
    console.error('✘ No existe dist/. Ejecuta "npm run build-only" antes del pre-renderizado.')
    process.exit(1)
  }

  await injectFontPreloads(path.join(DIST_DIR, 'index.html'))
  console.log('✔ Precarga de tipografías incrustada en index.html')

  // El pre-renderizado de "/" sobrescribe dist/index.html con el HTML ya
  // completo de la portada. Pero ese mismo archivo es también el destino de
  // la regla "catch-all" de public/.htaccess para CUALQUIER URL que no
  // reconozca (una URL con typo, o un artículo/ficha publicado en WordPress
  // después de este build y aún no incluido aquí): sin esta copia, un
  // rastreador que no ejecute JS vería el título/descripción/JSON-LD de la
  // portada puestos en esa URL -- peor que no tener nada. Se guarda antes de
  // tocar nada el shell neutro tal cual sale de `vite build`, y el
  // .htaccess usa esta copia (no index.html) como destino del catch-all.
  await copyFile(path.join(DIST_DIR, 'index.html'), path.join(DIST_DIR, 'app-shell.html'))

  console.log('Pre-renderizando rutas...')
  const dynamicRoutes = await fetchDynamicRoutes()
  const routes = [...STATIC_ROUTES, ...dynamicRoutes]

  const server = await startServer()
  const browser = await chromium.launch()

  try {
    // Secuencial (no en paralelo): cada página comparte el mismo servidor
    // estático local y limita el riesgo de saturar la API de WordPress con
    // decenas de peticiones simultáneas durante el build.
    for (const route of routes) {
      await prerenderRoute(browser, route)
    }
  } finally {
    await browser.close()
    server.close()
  }

  console.log(`✔ Pre-renderizado ${routes.length} rutas (${dynamicRoutes.length} dinámicas).`)
}

main().catch((err) => {
  console.error('✘ Error en el pre-renderizado:', err)
  process.exit(1)
})
