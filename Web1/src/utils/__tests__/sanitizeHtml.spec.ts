import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '../sanitizeHtml'

describe('sanitizeHtml', () => {
  it('returns an empty string for empty/falsy input', () => {
    expect(sanitizeHtml('')).toBe('')
  })

  it('strips <script> tags entirely', () => {
    const out = sanitizeHtml('<p>Hola</p><script>alert(1)</script>')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('alert')
    expect(out).toContain('<p>Hola</p>')
  })

  it('strips inline event handler attributes like onerror', () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">')
    expect(out).not.toContain('onerror')
    expect(out).toContain('src="x"')
  })

  it('strips javascript: URLs from links', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(out).not.toContain('javascript:')
  })

  it('removes iframe/object/embed tags', () => {
    const out = sanitizeHtml('<iframe src="https://evil.example"></iframe><object></object>')
    expect(out).not.toContain('<iframe')
    expect(out).not.toContain('<object')
  })

  it('keeps ordinary formatted content untouched', () => {
    const html =
      '<p>Texto <strong>importante</strong> con un <a href="https://kanbouripsicologia.com">enlace</a>.</p>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('keeps images with src, alt and srcset', () => {
    const html = '<img src="https://example.com/a.jpg" srcset="a.jpg 1x, b.jpg 2x" alt="foo">'
    const out = sanitizeHtml(html)
    expect(out).toContain('src="https://example.com/a.jpg"')
    expect(out).toContain('srcset="a.jpg 1x, b.jpg 2x"')
    expect(out).toContain('alt="foo"')
  })

  it('forces rel="noopener noreferrer" on links that keep target="_blank"', () => {
    const out = sanitizeHtml('<a href="https://example.com" target="_blank">link</a>')
    expect(out).toContain('target="_blank"')
    expect(out).toContain('rel="noopener noreferrer"')
  })
})
