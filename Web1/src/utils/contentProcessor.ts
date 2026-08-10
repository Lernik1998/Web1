/**
 * Utility functions to process WordPress content
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kanbouripsicologia.com'
import { parseVCShortcodes } from './vcShortcodeParser'
import { sanitizeHtml } from './sanitizeHtml'

/**
 * Los bloques de botón de WordPress ("wp-block-button") llegan sin href,
 * solo con el texto visible. Aquí mapeamos el texto (normalizado) a la
 * ruta interna correspondiente. Añadir aquí cualquier texto nuevo que
 * deba enlazar a una ruta de la SPA.
 */
const WP_BUTTON_TEXT_TO_ROUTE: Record<string, string> = {
  'pedir cita': '/pedir-cita',
  'ver tipos de terapia': '/terapias',
  'reservar supervisión': '/pedir-cita?servicio=profesionales',
}

/**
 * Process WordPress HTML content to fix image URLs and other media
 * Converts relative URLs to absolute URLs
 */
export const processWordPressContent = (html: string): string => {
  if (!html) return ''

  let processedHtml = html

  // First, parse Visual Composer shortcodes
  processedHtml = parseVCShortcodes(processedHtml)

  // Fix image src attributes - handle multiple patterns
  processedHtml = processedHtml.replace(
    /<img([^>]*?)src=["']([^"']*)["']([^>]*?)>/gi,
    (match, before, src, after) => {
      const absoluteSrc = makeAbsoluteUrl(src)
      return `<img${before}src="${absoluteSrc}"${after}>`
    },
  )

  // Fix image srcset attributes
  processedHtml = processedHtml.replace(
    /<img([^>]*?)srcset=["']([^"']*)["']([^>]*?)>/gi,
    (match, before, srcset, after) => {
      const absoluteSrcset = srcset
        .split(',')
        .map((item: string) => {
          const parts = item.trim().split(/\s+/)
          const url = parts[0]
          const descriptor = parts[1]
          if (!url) return ''
          const absoluteUrl = makeAbsoluteUrl(url)
          return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl
        })
        .filter(Boolean)
        .join(', ')
      return `<img${before}srcset="${absoluteSrcset}"${after}>`
    },
  )

  // Fix background-image in inline styles
  processedHtml = processedHtml.replace(
    /background-image:\s*url\(["']?([^"')]+)["']?\)/gi,
    (match, url) => {
      const absoluteUrl = makeAbsoluteUrl(url)
      return `background-image: url('${absoluteUrl}')`
    },
  )

  // Fix anchor links (optional - keep internal links working)
  processedHtml = processedHtml.replace(
    /<a([^>]*?)href=["']([^"']*)["']([^>]*?)>/gi,
    (match, before, href, after) => {
      // Skip if it's already an absolute URL or has a protocol
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) {
        return match
      }
      // Convert relative URLs to absolute
      const absoluteHref = makeAbsoluteUrl(href)
      return `<a${before}href="${absoluteHref}"${after}>`
    },
  )

  // Fix wp-block-button links: WordPress renders them without href, only
  // with the visible text, so we resolve the href from the known text map.
  processedHtml = processedHtml.replace(
    /<a([^>]*class="[^"]*wp-block-button__link[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi,
    (match, attrs, text) => {
      if (/\shref\s*=/i.test(attrs)) return match
      const route = WP_BUTTON_TEXT_TO_ROUTE[text.trim().toLowerCase()]
      if (!route) return match
      return `<a${attrs} href="${route}">${text}</a>`
    },
  )

  // Envolver tablas en un contenedor con scroll horizontal: en móvil una
  // tabla ancha desbordaría la página en vez de solo desplazarse.
  processedHtml = processedHtml.replace(
    /<table([^>]*)>([\s\S]*?)<\/table>/gi,
    (match) => `<div class="kb-table-wrap">${match}</div>`,
  )

  // Encabezados vacíos (p. ej. `<h1 class="wp-block-heading"></h1>`, típico
  // de un bloque "Encabezado" del editor de WordPress añadido y nunca
  // rellenado): se descartan en vez de dejarlos en el HTML final. Cada
  // vista ya pone su propio <h1> real; uno vacío duplicado confunde tanto a
  // los buscadores como a lectores de pantalla sobre cuál es el título real
  // de la página, y no aporta nada.
  processedHtml = processedHtml.replace(
    /<h[1-6][^>]*>(?:\s|&nbsp;)*<\/h[1-6]>/gi,
    '',
  )

  // Última barrera antes de que esto se inyecte con v-html: el HTML viene de
  // WordPress, no de este código, así que se sanea igual que cualquier otro
  // contenido de origen externo.
  return sanitizeHtml(processedHtml)
}

/**
 * Convert a URL to absolute if it's relative
 */
const makeAbsoluteUrl = (url: string): string => {
  if (!url) return url

  // Clean up the URL
  const cleanUrl = url.trim()

  // Handle URLs with query parameters (like ?id=380)
  const urlParts = cleanUrl.split('?')
  const baseUrl = urlParts[0] || ''
  const queryParams = urlParts.length > 1 ? `?${urlParts.slice(1).join('?')}` : ''

  // If it's already absolute, return as is
  if (
    baseUrl.startsWith('http://') ||
    baseUrl.startsWith('https://') ||
    baseUrl.startsWith('data:')
  ) {
    return cleanUrl
  }

  // If it starts with //, add the protocol
  if (baseUrl.startsWith('//')) {
    return `${API_BASE_URL.split('://')[0]}:${baseUrl}${queryParams}`
  }

  // If it's a relative path, prepend the API base URL
  if (baseUrl.startsWith('/')) {
    return `${API_BASE_URL}${baseUrl}${queryParams}`
  }

  // If it's a relative path without leading slash
  return `${API_BASE_URL}/${baseUrl}${queryParams}`
}

/**
 * Cuando el contenido de un artículo se pega desde Word/Google Docs, cada
 * salto de línea "suelto" del documento original se convierte en un `<br>`
 * dentro del mismo `<p>` de WordPress. El resultado son párrafos cortados en
 * fragmentos cortos que no respetan el ancho real del contenedor: en vez de
 * un texto que fluye y se ajusta solo, quedan líneas irregulares muy cortas,
 * con mucho hueco a la derecha (se percibe como texto "pegado a la
 * izquierda"). Aquí se eliminan esos `<br>` internos para que cada párrafo
 * vuelva a fluir como texto normal y se reajuste al ancho disponible.
 *
 * Solo actúa dentro de párrafos (`<p>`) de artículos de blog: no se aplica
 * al resto del contenido de WordPress (páginas legales, etc.), donde un
 * `<br>` suele ser intencional (p. ej. listar dirección, NIF y teléfono en
 * líneas separadas dentro de un mismo párrafo).
 */
export const reflowSoftLineBreaks = (html: string): string => {
  if (!html) return html
  return html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi, (match, attrs, inner) => {
    const reflowed = inner
      .replace(/\s*<br\s*\/?>\s*/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
    return `<p${attrs}>${reflowed}</p>`
  })
}

/**
 * Extract plain text from HTML (for summaries, meta descriptions, etc.)
 *
 * Se parsea con DOMParser (documento inerte, sin renderizar) en vez de
 * asignar el HTML a `innerHTML` de un nodo real: un `<img onerror="...">`
 * dentro del HTML de WordPress dispararía ese `onerror` en cuanto el
 * navegador intente cargar la imagen, aunque el div esté desconectado del
 * documento. DOMParser no dispara carga de recursos ni ejecuta nada.
 */
export const extractTextFromHtml = (html: string, maxLength = 160): string => {
  if (!html) return ''

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const text = doc.body.textContent || ''

  // Truncate if needed
  return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text
}

/**
 * Extract the first <img> src from a block of HTML. Se usa como imagen de
 * respaldo para artículos del blog que no tienen imagen destacada asignada
 * en WordPress, pero sí traen una imagen incrustada en el propio contenido.
 */
export const extractFirstImageUrl = (html: string): string | null => {
  if (!html) return null
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1] ? makeAbsoluteUrl(match[1]) : null
}
