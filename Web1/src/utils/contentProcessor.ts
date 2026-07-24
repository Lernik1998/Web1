/**
 * Utility functions to process WordPress content
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kanbouripsicologia.com'

/**
 * Process WordPress HTML content to fix image URLs and other media
 * Converts relative URLs to absolute URLs
 */
export const processWordPressContent = (html: string): string => {
  if (!html) return ''

  let processedHtml = html

  // Fix image src attributes
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

  return processedHtml
}

/**
 * Convert a URL to absolute if it's relative
 */
const makeAbsoluteUrl = (url: string): string => {
  if (!url) return url

  // If it's already absolute, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }

  // If it starts with //, add the protocol
  if (url.startsWith('//')) {
    return `${API_BASE_URL.split('://')[0]}:${url}`
  }

  // If it's a relative path, prepend the API base URL
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`
  }

  // If it's a relative path without leading slash
  return `${API_BASE_URL}/${url}`
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
