import { describe, it, expect } from 'vitest'
import { parseTeamContent } from '../teamParser'

describe('parseTeamContent', () => {
  it('parses the "team" page pattern (bold name + bold role)', () => {
    const html = `
      <p><strong>Maria B. Kanbouri</strong></p>
      <p><strong>Directora y psicóloga clínica</strong></p>
      <p>Primer párrafo de biografía.</p>
      <p>Segundo párrafo de biografía.</p>
      <p>Formación académica</p>
      <ul><li>Grado en Psicología</li><li>Máster en Psicología Clínica</li></ul>
      <p>Formación extracurricular</p>
      <ul><li>Curso de Mindfulness</li></ul>
    `
    const members = parseTeamContent(html)
    expect(members).toHaveLength(1)
    const m = members[0]!
    expect(m.slug).toBe('maria-b-kanbouri')
    expect(m.name).toBe('Maria B. Kanbouri')
    expect(m.role).toBe('Directora y psicóloga clínica')
    expect(m.photo).toBeNull()
    expect(m.bio).toEqual(['Primer párrafo de biografía.', 'Segundo párrafo de biografía.'])
    expect(m.formacionAcademica).toEqual(['Grado en Psicología', 'Máster en Psicología Clínica'])
    expect(m.formacionExtra).toEqual(['Curso de Mindfulness'])
  })

  it('parses the "about-me" pattern where only the role is bold', () => {
    const html = `
      <p>Beatriz Donet</p>
      <p><strong>Psicóloga infantil</strong></p>
      <p>Biografía de Beatriz.</p>
    `
    const members = parseTeamContent(html)
    expect(members).toHaveLength(1)
    const m = members[0]!
    expect(m.slug).toBe('beatriz-donet')
    expect(m.name).toBe('Beatriz Donet')
    expect(m.role).toBe('Psicóloga infantil')
    expect(m.bio).toEqual(['Biografía de Beatriz.'])
    expect(m.formacionAcademica).toEqual([])
    expect(m.formacionExtra).toEqual([])
  })

  it('extracts a photo from a <figure> embedded mid-bio', () => {
    const html = `
      <p>Ester Pinedo Gil</p>
      <p><strong>Psicóloga</strong></p>
      <p>Primer párrafo.</p>
      <figure><img src="/wp-content/uploads/ester.png" alt="Ester" /></figure>
      <p>Segundo párrafo tras la foto.</p>
    `
    const members = parseTeamContent(html)
    expect(members).toHaveLength(1)
    const m = members[0]!
    expect(m.photo).toBe('/wp-content/uploads/ester.png')
    expect(m.bio).toEqual(['Primer párrafo.', 'Segundo párrafo tras la foto.'])
  })

  it('deduplicates slugs for two people with the same name', () => {
    const html = `
      <p><strong>Ana García</strong></p>
      <p><strong>Psicóloga</strong></p>
      <p>Bio uno.</p>
      <p><strong>Ana García</strong></p>
      <p><strong>Psicóloga senior</strong></p>
      <p>Bio dos.</p>
    `
    const members = parseTeamContent(html)
    expect(members).toHaveLength(2)
    expect(members[0]!.slug).toBe('ana-garcia')
    expect(members[1]!.slug).toBe('ana-garcia-2')
    expect(members[1]!.role).toBe('Psicóloga senior')
  })

  it('returns empty formación arrays (not throwing) when sections are missing entirely', () => {
    const html = `
      <p><strong>Juan Pérez</strong></p>
      <p><strong>Psicólogo</strong></p>
      <p>Biografía sin ninguna sección adicional.</p>
    `
    expect(() => parseTeamContent(html)).not.toThrow()
    const members = parseTeamContent(html)
    expect(members).toHaveLength(1)
    const m = members[0]!
    expect(m.formacionAcademica).toEqual([])
    expect(m.formacionExtra).toEqual([])
    expect(m.bio).toEqual(['Biografía sin ninguna sección adicional.'])
  })

  it('reconstructs real paragraphs from a Word-pasted bio using single <br> for both line wraps and paragraph breaks, without merging words at the break', () => {
    const html = `
      <p>Maria B. Kanbouri</p>
      <p><strong>Psicóloga para adultos y parejas en Denia</strong></p>
      <p>Desde muy pequeña sentía una enorme curiosidad por entender a las personas. Me<br>fascinaba observar cómo cada uno vivía las dificultades.<br>El camino hasta llegar aquí no fue lineal. Antes de poder dedicarme a la psicología<br>trabajé en otros ámbitos que nada tenían que ver con esta profesión. Sin embargo,<br>siempre tuve claro que eran solo una etapa.</p>
    `
    const members = parseTeamContent(html)
    const m = members[0]!

    expect(m.bio).toEqual([
      'Desde muy pequeña sentía una enorme curiosidad por entender a las personas. Me fascinaba observar cómo cada uno vivía las dificultades.',
      'El camino hasta llegar aquí no fue lineal. Antes de poder dedicarme a la psicología trabajé en otros ámbitos que nada tenían que ver con esta profesión. Sin embargo, siempre tuve claro que eran solo una etapa.',
    ])
    // Ninguna palabra debe quedar pegada a la siguiente por la falta de espacio del <br>.
    expect(m.bio.join(' ')).not.toContain('Mefascinaba')
  })

  it('returns an empty array for empty input', () => {
    expect(parseTeamContent('')).toEqual([])
  })

  it('falls back to "profesional" slug when the name has no alphanumeric characters', () => {
    const html = `
      <p><strong>!!!</strong></p>
      <p><strong>Cargo</strong></p>
      <p>Bio.</p>
    `
    const members = parseTeamContent(html)
    expect(members).toHaveLength(1)
    expect(members[0]!.slug).toBe('profesional')
  })
})
