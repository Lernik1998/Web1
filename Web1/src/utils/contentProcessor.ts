/**
 * Utility functions to process WordPress content
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kanbouripsicologia.com'
import { parseVCShortcodes } from './vcShortcodeParser'

/**
 * Los bloques de botón de WordPress ("wp-block-button") llegan sin href,
 * solo con el texto visible. Aquí mapeamos el texto (normalizado) a la
 * ruta interna correspondiente. Añadir aquí cualquier texto nuevo que
 * deba enlazar a una ruta de la SPA.
 */
const WP_BUTTON_TEXT_TO_ROUTE: Record<string, string> = {
  'pedir cita': '/pedir-cita',
  'ver tipos de terapia': '/terapia-online',
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

  return processedHtml
}

/**
 * Convert a URL to absolute if it's relative
 */
const makeAbsoluteUrl = (url: string): string => {
  if (!url) return url

  // Clean up the URL
  const cleanUrl = url.trim()

  // Handle URLs with query parameters (like ?id=380)
  const hasQueryParams = cleanUrl.includes('?')
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
 * Extract plain text from HTML (for summaries, meta descriptions, etc.)
 */
export const extractTextFromHtml = (html: string, maxLength = 160): string => {
  if (!html) return ''

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // Get text content
  const text = tempDiv.textContent || tempDiv.innerText || ''

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
