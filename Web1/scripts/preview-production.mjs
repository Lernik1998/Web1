// Sirve dist/ igual que lo hará Plesk/Apache en producción (ver
// public/.htaccess, que se copia a dist/.htaccess en el build), replicando
// sus dos reglas de mod_rewrite:
//   1. Una URL como /sobre-mi (sin barra final) que coincide con una carpeta
//      con su propio index.html (pre-renderizada por scripts/prerender.mjs)
//      sirve ESE archivo directamente, sin redirigir.
//   2. Cualquier otra URL que no sea ni archivo ni carpeta real cae en
//      app-shell.html (el SPA fallback de vue-router).
//
// Por qué existe: `vite preview` y `npx serve` no leen .htaccess (eso es
// exclusivo de Apache), así que para una URL sin barra final devuelven el
// index.html equivocado (el de la portada) en vez del de esa ruta -- eso
// hace que la página pierda sus propios datos ya incrustados y tenga que
// volver a pedirlos a la API, mostrando "Cargando..." aunque en el sitio
// real (con el .htaccess de verdad) no pase. Usa este servidor en vez de
// esos dos para probar en local con el mismo comportamiento que producción.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const PORT = 4174

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
}

if (!fs.existsSync(DIST)) {
  console.error('No existe dist/ todavía -- ejecuta "npm run build" primero.')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0])
  const filePath = path.join(DIST, urlPath)

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return send(res, filePath)
  }

  const indexFile = path.join(filePath, 'index.html')
  if (fs.existsSync(indexFile)) {
    return send(res, indexFile)
  }

  const shell = path.join(DIST, 'app-shell.html')
  if (fs.existsSync(shell)) {
    return send(res, shell, 404)
  }

  res.writeHead(404)
  res.end('Not found')
})

function send(res, filePath, status = 200) {
  const ext = path.extname(filePath)
  res.writeHead(status, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  fs.createReadStream(filePath).pipe(res)
}

server.listen(PORT, () => {
  console.log(`Vista previa "como producción" en http://localhost:${PORT}`)
})
