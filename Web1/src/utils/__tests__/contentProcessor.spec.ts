import { describe, it, expect } from 'vitest'
import {
  processWordPressContent,
  extractTextFromHtml,
  extractFirstImageUrl,
} from '../contentProcessor'

const API_BASE_URL = 'https://kanbouripsicologia.com'

describe('processWordPressContent', () => {
  it('rewrites a relative img src to an absolute URL', () => {
    const html = `<img src="/wp-content/uploads/foo.jpg" alt="foo">`
    const out = processWordPressContent(html)
    expect(out).toContain(`src="${API_BASE_URL}/wp-content/uploads/foo.jpg"`)
  })

  it('leaves an already-absolute img src untouched', () => {
    const html = `<img src="https://cdn.example.com/foo.jpg" alt="foo">`
    const out = processWordPressContent(html)
    expect(out).toContain(`src="https://cdn.example.com/foo.jpg"`)
  })

  it('leaves a data: URL untouched', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB'
    const html = `<img src="${dataUrl}" alt="foo">`
    const out = processWordPressContent(html)
    expect(out).toContain(`src="${dataUrl}"`)
  })

  it('rewrites relative URLs inside an img srcset, preserving descriptors', () => {
    const html = `<img src="/a.jpg" srcset="/a-300.jpg 300w, /a-600.jpg 600w">`
    const out = processWordPressContent(html)
    expect(out).toContain(
      `srcset="${API_BASE_URL}/a-300.jpg 300w, ${API_BASE_URL}/a-600.jpg 600w"`,
    )
  })

  it('maps wp-block-button text to the known internal route when href is missing', () => {
    const html = `<a class="wp-block-button__link">Pedir cita</a>`
    const out = processWordPressContent(html)
    expect(out).toContain(`href="/pedir-cita"`)
  })

  it('does not overwrite an existing href on a wp-block-button link (only absolutizes it)', () => {
    const html = `<a class="wp-block-button__link" href="/custom">Pedir cita</a>`
    const out = processWordPressContent(html)
    // The generic anchor-rewriting pass absolutizes the relative href, but the
    // wp-block-button pass must not clobber it with the "pedir cita" route mapping.
    expect(out).toContain(`href="${API_BASE_URL}/custom"`)
    expect(out).not.toContain('href="/pedir-cita"')
  })

  it('leaves a wp-block-button link untouched when the text has no route mapping', () => {
    const html = `<a class="wp-block-button__link">Texto desconocido</a>`
    const out = processWordPressContent(html)
    expect(out).toBe(html)
  })

  it('wraps <table> elements in a scrollable container', () => {
    const html = `<table><tr><td>1</td></tr></table>`
    const out = processWordPressContent(html)
    // El saneado (DOMPurify) reserializa el HTML y añade el <tbody> implícito
    // que el propio navegador insertaría de todas formas al parsear la tabla.
    expect(out).toBe('<div class="kb-table-wrap"><table><tbody><tr><td>1</td></tr></tbody></table></div>')
  })

  it('returns an empty string for empty input', () => {
    expect(processWordPressContent('')).toBe('')
  })
})

describe('extractTextFromHtml', () => {
  it('returns an empty string for empty input', () => {
    expect(extractTextFromHtml('')).toBe('')
  })

  it('strips tags and returns plain text for populated HTML', () => {
    const html = `<p>Hola <strong>mundo</strong></p>`
    expect(extractTextFromHtml(html)).toBe('Hola mundo')
  })

  it('truncates text longer than maxLength and appends an ellipsis', () => {
    const longText = 'a'.repeat(200)
    const html = `<p>${longText}</p>`
    const result = extractTextFromHtml(html, 20)
    expect(result).toBe('a'.repeat(20) + '...')
  })

  it('parses malicious markup inertly (DOMParser, not a live innerHTML node)', () => {
    // Un <img onerror> asignado a innerHTML de un nodo real dispararía el
    // handler al intentar cargar la imagen, incluso desconectado del
    // documento. Aquí solo debe extraerse el texto, sin ejecutar nada.
    const html = '<img src="x" onerror="window.__pwned = true"><p>Resumen real</p>'
    expect(extractTextFromHtml(html)).toBe('Resumen real')
    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined()
  })
})

describe('extractFirstImageUrl', () => {
  it('returns null for empty input', () => {
    expect(extractFirstImageUrl('')).toBeNull()
  })

  it('returns null when there is no <img> tag', () => {
    expect(extractFirstImageUrl('<p>No image here</p>')).toBeNull()
  })

  it('extracts and absolutizes the first image URL found', () => {
    const html = `<p>Text</p><img src="/uploads/first.jpg"><img src="/uploads/second.jpg">`
    expect(extractFirstImageUrl(html)).toBe(`${API_BASE_URL}/uploads/first.jpg`)
  })

  it('leaves an already-absolute first image URL untouched', () => {
    const html = `<img src="https://cdn.example.com/first.jpg">`
    expect(extractFirstImageUrl(html)).toBe('https://cdn.example.com/first.jpg')
  })
})
