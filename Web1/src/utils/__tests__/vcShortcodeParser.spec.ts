import { describe, it, expect } from 'vitest'
import { parseVCShortcodes } from '../vcShortcodeParser'

const API_BASE_URL = 'https://kanbouripsicologia.com'

describe('parseVCShortcodes', () => {
  it('returns an empty string for empty input', () => {
    expect(parseVCShortcodes('')).toBe('')
  })

  it('converts vc_row/vc_column pairs into nested divs', () => {
    const input = '[vc_row][vc_column]Contenido[/vc_column][/vc_row]'
    const out = parseVCShortcodes(input)
    expect(out).toBe(
      '<div class="vc-row" style=""><div class="vc-column" style="">Contenido</div></div>',
    )
  })

  it('converts vc_row_inner/vc_column_inner pairs', () => {
    const input = '[vc_row_inner][vc_column_inner]X[/vc_column_inner][/vc_row_inner]'
    const out = parseVCShortcodes(input)
    expect(out).toBe(
      '<div class="vc-row-inner" style=""><div class="vc-column-inner" style="">X</div></div>',
    )
  })

  it('extracts inline CSS from the css attribute into a style attribute', () => {
    const input = '[vc_row css=".vc_custom_123{padding-top: 80px !important;}"][/vc_row]'
    const out = parseVCShortcodes(input)
    expect(out).toContain('style="padding-top: 80px !important;"')
  })

  it('converts vc_column_text into a div and preserves inner content', () => {
    const input = '[vc_column_text]<p>Texto de columna</p>[/vc_column_text]'
    const out = parseVCShortcodes(input)
    expect(out).toBe('<div class="vc-column-text " style=""><p>Texto de columna</p></div>')
  })

  it('prepends a background image extracted from css on vc_column_text', () => {
    const input =
      '[vc_column_text css=".vc_custom_1{background-image: url(/uploads/bg.jpg);}"]Hola[/vc_column_text]'
    const out = parseVCShortcodes(input)
    expect(out).toContain(`<img src="${API_BASE_URL}/uploads/bg.jpg"`)
    expect(out).toContain('Hola')
  })

  it('converts vc_separator into an <hr>', () => {
    const input = '[vc_separator]'
    const out = parseVCShortcodes(input)
    expect(out).toBe('<hr class="vc-separator" style="" />')
  })

  it('converts vc_single_image with an image attribute into an <img>, absolutizing the URL', () => {
    const input = '[vc_single_image image="/uploads/photo.jpg"]'
    const out = parseVCShortcodes(input)
    expect(out).toBe(
      `<img src="${API_BASE_URL}/uploads/photo.jpg" class="vc-single-image" style="display: block; margin: 0 auto; max-width: 100%;" alt="Image" />`,
    )
  })

  it('returns an empty string for vc_single_image with no image attribute', () => {
    const input = '[vc_single_image]'
    expect(parseVCShortcodes(input)).toBe('')
  })

  it('converts vc_custom_heading into the tag specified by font_container', () => {
    const input = '[vc_custom_heading font_container="tag:h3|text_align:left"]Título[/vc_custom_heading]'
    const out = parseVCShortcodes(input)
    expect(out).toBe('<h3 class="vc-custom-heading" style="">Título</h3>')
  })

  it('defaults vc_custom_heading to <h2> when font_container has no tag', () => {
    const input = '[vc_custom_heading]Título[/vc_custom_heading]'
    const out = parseVCShortcodes(input)
    expect(out).toBe('<h2 class="vc-custom-heading" style="">Título</h2>')
  })
})
