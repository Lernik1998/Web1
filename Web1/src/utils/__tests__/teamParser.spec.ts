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

  it('does not stop the bio at a paragraph that only PARTLY bolds a phrase mid-sentence', () => {
    const html = `
      <p>Maria B. Kanbouri</p>
      <p><strong>Psicóloga en Denia</strong></p>
      <p>Soy Maria, <strong>psicóloga en Denia</strong> especializada en adultos.</p>
      <p>Segundo párrafo de biografía.</p>
    `
    const members = parseTeamContent(html)
    expect(members).toHaveLength(1)
    const m = members[0]!
    expect(m.bio).toEqual([
      'Soy Maria, psicóloga en Denia especializada en adultos.',
      'Segundo párrafo de biografía.',
    ])
  })

  it('still recognizes the role paragraph when a single stray character splits one <strong> into two (e.g. an accent edited in without extending the bold selection)', () => {
    const html = `
      <p>Maria B. Kanbouri</p>
      <p><strong>Psicóloga en D</strong>é<strong>nia para adultos y parejas</strong></p>
      <p>Biografía.</p>
    `
    const members = parseTeamContent(html)
    expect(members).toHaveLength(1)
    const m = members[0]!
    expect(m.role).toBe('Psicóloga en Dénia para adultos y parejas')
    expect(m.bio).toEqual(['Biografía.'])
  })

  it('recognizes <h2> section headings for "Formación" labels, and groups paragraphs after an intermediate <h2> subheading into a named section instead of dropping them', () => {
    const html = `
      <p>Maria B. Kanbouri</p>
      <p><strong>Psicóloga en Denia</strong></p>
      <p>Primer párrafo.</p>
      <h2 class="wp-block-heading">Mi trayectoria</h2>
      <p>Segundo párrafo, después del subtítulo.</p>
      <figure><img src="/foto.jpg" /></figure>
      <h2 class="wp-block-heading">Formación Académica</h2>
      <ul><li>Grado en Psicología</li></ul>
      <h2 class="wp-block-heading">Formación extracurricular</h2>
      <ul><li>Curso de EMDR</li></ul>
    `
    const members = parseTeamContent(html)
    expect(members).toHaveLength(1)
    const m = members[0]!
    expect(m.bio).toEqual(['Primer párrafo.'])
    expect(m.sections).toEqual([
      { heading: 'Mi trayectoria', paragraphs: ['Segundo párrafo, después del subtítulo.'] },
    ])
    expect(m.photo).toBe('/foto.jpg')
    expect(m.formacionAcademica).toEqual(['Grado en Psicología'])
    expect(m.formacionExtra).toEqual(['Curso de EMDR'])
  })

  it('drops an <h2> subheading that has no paragraphs after it (e.g. immediately followed by another heading)', () => {
    const html = `
      <p>Maria B. Kanbouri</p>
      <p><strong>Psicóloga en Denia</strong></p>
      <p>Primer párrafo.</p>
      <h2 class="wp-block-heading">Subtítulo vacío</h2>
      <h2 class="wp-block-heading">Formación Académica</h2>
      <ul><li>Grado en Psicología</li></ul>
    `
    const members = parseTeamContent(html)
    const m = members[0]!
    expect(m.sections).toEqual([])
    expect(m.formacionAcademica).toEqual(['Grado en Psicología'])
  })

  it('groups multiple consecutive <h2> subheadings each with their own following paragraphs, in order', () => {
    const html = `
      <p>Maria B. Kanbouri</p>
      <p><strong>Psicóloga en Denia</strong></p>
      <h2 class="wp-block-heading">Primera sección</h2>
      <p>Texto de la primera sección.</p>
      <h2 class="wp-block-heading">Segunda sección</h2>
      <p>Texto de la segunda sección.</p>
    `
    const members = parseTeamContent(html)
    const m = members[0]!
    expect(m.bio).toEqual([])
    expect(m.sections).toEqual([
      { heading: 'Primera sección', paragraphs: ['Texto de la primera sección.'] },
      { heading: 'Segunda sección', paragraphs: ['Texto de la segunda sección.'] },
    ])
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
