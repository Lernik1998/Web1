import { describe, it, expect } from 'vitest'
import { parseTherapyContent } from '../therapyParser'

describe('parseTherapyContent', () => {
  it('extracts the intro paragraph', () => {
    const html = `<p>Introducción a la terapia infantil.</p>`
    const result = parseTherapyContent(html)
    expect(result.intro).toBe('Introducción a la terapia infantil.')
    expect(result.blocks).toEqual([])
  })

  it('parses a list block with an <h2> title', () => {
    const html = `
      <p>Intro.</p>
      <h2>¿Cuándo acudir?</h2>
      <ul><li>Ansiedad</li><li>Cambios de humor</li></ul>
    `
    const result = parseTherapyContent(html)
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0]).toEqual({
      title: '¿Cuándo acudir?',
      type: 'list',
      items: ['Ansiedad', 'Cambios de humor'],
      text: '',
    })
  })

  it('parses a text block with a plain <p> title', () => {
    const html = `
      <p>Intro.</p>
      <p>¿En qué consiste?</p>
      <p>Consiste en sesiones semanales.</p>
    `
    const result = parseTherapyContent(html)
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0]).toEqual({
      title: '¿En qué consiste?',
      type: 'text',
      items: [],
      text: 'Consiste en sesiones semanales.',
    })
  })

  it('handles mixed order of h2/list and p/text blocks', () => {
    const html = `
      <p>Intro.</p>
      <h2>Síntomas</h2>
      <ul><li>Uno</li><li>Dos</li></ul>
      <p>¿Cómo ayudamos?</p>
      <p>Con terapia individual.</p>
    `
    const result = parseTherapyContent(html)
    expect(result.blocks).toHaveLength(2)
    expect(result.blocks[0]).toMatchObject({ title: 'Síntomas', type: 'list' })
    expect(result.blocks[1]).toMatchObject({ title: '¿Cómo ayudamos?', type: 'text' })
  })

  it('skips a title with no following content element instead of throwing', () => {
    const html = `
      <p>Intro.</p>
      <h2>Título huérfano</h2>
    `
    expect(() => parseTherapyContent(html)).not.toThrow()
    const result = parseTherapyContent(html)
    expect(result.blocks).toEqual([])
  })

  it('skips an orphan title followed by another title and continues parsing', () => {
    // "Huérfano" es seguido por otro <h2> (ni UL ni P), así que se descarta
    // ese título (rama `i += 1`) y el siguiente título sí se procesa bien.
    const html = `
      <p>Intro.</p>
      <h2>Huérfano</h2>
      <h2>Válido</h2>
      <p>Contenido válido.</p>
    `
    const result = parseTherapyContent(html)
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0]).toMatchObject({ title: 'Válido', type: 'text', text: 'Contenido válido.' })
  })

  it('returns an empty intro and no blocks for empty input', () => {
    const result = parseTherapyContent('')
    expect(result.intro).toBe('')
    expect(result.blocks).toEqual([])
  })
})
