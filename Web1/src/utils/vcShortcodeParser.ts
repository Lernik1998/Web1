/**
 * Parser for Visual Composer shortcodes
 * Extracts images and other media from VC shortcodes
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kanbouripsicologia.com'

/**
 * Parse Visual Composer shortcodes and convert them to HTML
 */
export const parseVCShortcodes = (content: string): string => {
  if (!content) return ''

  let processedContent = content

  // Parse vc_row
  // (negative lookahead: "[vc_row_inner ...]" must be left for the vc_row_inner
  // rule below, otherwise this broader regex greedily swallows it first.)
  processedContent = processedContent.replace(/\[vc_row(?!_inner)([^\]]*)\]/gi, (match, attrs) => {
    const parsedAttrs = parseShortcodeAttrs(attrs)
    const style = buildStyleFromAttrs(parsedAttrs)
    return `<div class="vc-row" style="${style}">`
  })

  processedContent = processedContent.replace(/\[\/vc_row\]/gi, '</div>')

  // Parse vc_column
  // (negative lookahead: leave "[vc_column_inner ...]" and "[vc_column_text ...]"
  // for their own more specific rules below/above, same reasoning as vc_row.)
  processedContent = processedContent.replace(/\[vc_column(?!_inner|_text)([^\]]*)\]/gi, (match, attrs) => {
    const parsedAttrs = parseShortcodeAttrs(attrs)
    const style = buildStyleFromAttrs(parsedAttrs)
    return `<div class="vc-column" style="${style}">`
  })

  processedContent = processedContent.replace(/\[\/vc_column\]/gi, '</div>')

  // Parse vc_column_inner
  processedContent = processedContent.replace(/\[vc_column_inner([^\]]*)\]/gi, (match, attrs) => {
    const parsedAttrs = parseShortcodeAttrs(attrs)
    const style = buildStyleFromAttrs(parsedAttrs)
    return `<div class="vc-column-inner" style="${style}">`
  })

  processedContent = processedContent.replace(/\[\/vc_column_inner\]/gi, '</div>')

  // Parse vc_row_inner
  processedContent = processedContent.replace(/\[vc_row_inner([^\]]*)\]/gi, (match, attrs) => {
    const parsedAttrs = parseShortcodeAttrs(attrs)
    const style = buildStyleFromAttrs(parsedAttrs)
    return `<div class="vc-row-inner" style="${style}">`
  })

  processedContent = processedContent.replace(/\[\/vc_row_inner\]/gi, '</div>')

  // Parse vc_column_text with background images
  processedContent = processedContent.replace(
    /\[vc_column_text([^\]]*)\]([\s\S]*?)\[\/vc_column_text\]/gi,
    (match, attrs, content) => {
      const parsedAttrs = parseShortcodeAttrs(attrs)
      const style = buildStyleFromAttrs(parsedAttrs)
      const elClass = parsedAttrs.el_class || ''

      // Extract background image from CSS and add as img tag for visibility
      let enhancedContent = content
      if (parsedAttrs.css && parsedAttrs.css.includes('background-image')) {
        const bgMatch = parsedAttrs.css.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i)
        if (bgMatch && bgMatch[1]) {
          const imageUrl = makeAbsoluteUrl(bgMatch[1])
          enhancedContent =
            `<img src="${imageUrl}" style="max-width: 100%; display: block; margin: 0 auto;" alt="Background image" />` +
            enhancedContent
        }
      }

      return `<div class="vc-column-text ${elClass}" style="${style}">${enhancedContent}</div>`
    },
  )

  // Parse vc_separator
  processedContent = processedContent.replace(/\[vc_separator([^\]]*)\]/gi, (match, attrs) => {
    const parsedAttrs = parseShortcodeAttrs(attrs)
    const style = buildStyleFromAttrs(parsedAttrs)
    return `<hr class="vc-separator" style="${style}" />`
  })

  // Parse vc_single_image
  processedContent = processedContent.replace(/\[vc_single_image([^\]]*)\]/gi, (match, attrs) => {
    const parsedAttrs = parseShortcodeAttrs(attrs)
    const image = parsedAttrs.image || ''

    if (image) {
      // Try to get image URL from ID (this would need API call, for now use placeholder)
      const imageUrl = makeAbsoluteUrl(image)
      return `<img src="${imageUrl}" class="vc-single-image" style="display: block; margin: 0 auto; max-width: 100%;" alt="Image" />`
    }
    return ''
  })

  // Parse vc_custom_heading
  processedContent = processedContent.replace(
    /\[vc_custom_heading([^\]]*)\]([\s\S]*?)\[\/vc_custom_heading\]/gi,
    (match, attrs, text) => {
      const parsedAttrs = parseShortcodeAttrs(attrs)
      const style = buildStyleFromAttrs(parsedAttrs)
      const fontContainer = parsedAttrs.font_container || ''
      const tagMatch = fontContainer.match(/tag:([a-z0-9]+)/i)
      const tag = tagMatch ? tagMatch[1] : 'h2'
      return `<${tag} class="vc-custom-heading" style="${style}">${text}</${tag}>`
    },
  )

  return processedContent
}

/**
 * Parse shortcode attributes
 */
const parseShortcodeAttrs = (attrsString: string): Record<string, string> => {
  const attrs: Record<string, string> = {}

  if (!attrsString) return attrs

  // Normalize quotes - convert typographic quotes to regular quotes
  const normalizedAttrs = attrsString
    .replace(/»/g, '"')
    .replace(/«/g, '"')
    .replace(/"/g, '"')
    .replace(/"/g, '"')

  // Match key="value" pairs
  const regex = /(\w+)=["']([^"']*)["']/g
  let match

  while ((match = regex.exec(normalizedAttrs)) !== null) {
    const key = match[1]
    const value = match[2]
    if (key && value) {
      attrs[key] = value
    }
  }

  return attrs
}

/**
 * Build CSS style string from shortcode attributes
 */
const buildStyleFromAttrs = (attrs: Record<string, string>): string => {
  const styles: string[] = []

  // Extract CSS from css attribute
  if (attrs.css) {
    // Parse CSS like .vc_custom_123{padding-top: 80px !important;}
    const cssMatch = attrs.css.match(/\{([^}]*)\}/)
    if (cssMatch && cssMatch[1]) {
      styles.push(cssMatch[1])
    }
  }

  // Extract background-image from css attribute
  if (attrs.css && attrs.css.includes('background-image')) {
    const bgMatch = attrs.css.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/)
    if (bgMatch && bgMatch[1]) {
      const absoluteUrl = makeAbsoluteUrl(bgMatch[1])
      styles.push(`background-image: url('${absoluteUrl}')`)
    }
  }

  return styles.join('; ')
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
