import { describe, it, expect } from 'vitest'
import { parseProfesionalAcf } from '../profesionalAcf'
import type { ProfesionalAcf } from '../../types/api'

function makeAcf(overrides: Partial<ProfesionalAcf> = {}): ProfesionalAcf {
  return {
    position: '',
    hero_image: 0,
    short_description: '',
    work_description: '',
    license_number: '',
    academic_training: '',
    extra_training: '',
    ...overrides,
  }
}

describe('parseProfesionalAcf', () => {
  it('extracts the role and license number as-is', () => {
    const result = parseProfesionalAcf(
      makeAcf({ position: 'Psicóloga Infantil', license_number: 'Col. CV12345' }),
    )
    expect(result.role).toBe('Psicóloga Infantil')
    expect(result.licenseNumber).toBe('Col. CV12345')
  })

  it('unwraps soft line-wraps within a paragraph but keeps real paragraph breaks', () => {
    const result = parseProfesionalAcf(
      makeAcf({
        short_description: 'Enfocada en transformar las crisis en\r\noportunidades de crecimiento.',
        work_description: 'Primer párrafo.\r\n\r\nSegundo párrafo real.',
      }),
    )
    expect(result.bio).toEqual([
      'Enfocada en transformar las crisis en oportunidades de crecimiento.',
      'Primer párrafo.',
      'Segundo párrafo real.',
    ])
  })

  it('splits academic/extra training into one list item per line', () => {
    const result = parseProfesionalAcf(
      makeAcf({
        academic_training: 'Grado en Psicología.\r\nMáster en PGS.',
        extra_training: 'Curso de EMDR.',
      }),
    )
    expect(result.formacionAcademica).toEqual(['Grado en Psicología.', 'Máster en PGS.'])
    expect(result.formacionExtra).toEqual(['Curso de EMDR.'])
  })

  it('returns empty fields when the ACF values are empty, without throwing', () => {
    const result = parseProfesionalAcf(makeAcf())
    expect(result.role).toBe('')
    expect(result.bio).toEqual([])
    expect(result.licenseNumber).toBe('')
    expect(result.formacionAcademica).toEqual([])
    expect(result.formacionExtra).toEqual([])
  })
})
