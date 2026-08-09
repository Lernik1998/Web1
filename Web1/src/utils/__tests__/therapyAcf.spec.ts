import { describe, it, expect } from 'vitest'
import { parseTherapieAcf } from '../therapyAcf'
import type { TherapieAcf } from '../../types/api'

function makeAcf(overrides: Partial<TherapieAcf> = {}): TherapieAcf {
  return {
    therapy_name: 'Ansiedad',
    specialty: 'adult',
    therapy_description: 'Terapia para gestionar la ansiedad.\r\n\r\n',
    therapy_image: 12,
    when_title: '¿Cuándo puede ayudar la terapia?',
    when_items: 'Preocupación excesiva\r\nDificultad para relajarse',
    how_title: 'Cómo trabajamos',
    how_description: 'Trabajamos con técnicas de regulación emocional.',
    benefits_title: 'Qué te llevas del proceso',
    benefits_items: 'Más calma\r\nHerramientas para el día a día',
    ...overrides,
  }
}

describe('parseTherapieAcf', () => {
  it('trims and collapses whitespace in the intro', () => {
    const result = parseTherapieAcf(makeAcf())
    expect(result.intro).toBe('Terapia para gestionar la ansiedad.')
  })

  it('builds a "when" list block, a "how" text block and a "benefits" list block, in that order', () => {
    const acf = makeAcf()
    const result = parseTherapieAcf(acf)

    expect(result.blocks).toEqual([
      {
        title: acf.when_title,
        type: 'list',
        items: ['Preocupación excesiva', 'Dificultad para relajarse'],
        text: '',
      },
      {
        title: acf.how_title,
        type: 'text',
        items: [],
        text: acf.how_description,
      },
      {
        title: acf.benefits_title,
        type: 'list',
        items: ['Más calma', 'Herramientas para el día a día'],
        text: '',
      },
    ])
  })

  it('filters out blank lines when splitting list fields', () => {
    const acf = makeAcf({ when_items: 'One\r\n\r\nTwo\r\n' })
    const result = parseTherapieAcf(acf)
    expect(result.blocks[0]!.items).toEqual(['One', 'Two'])
  })

  it('handles missing/undefined fields without throwing', () => {
    const acf = { ...makeAcf(), therapy_description: undefined as unknown as string }
    expect(() => parseTherapieAcf(acf)).not.toThrow()
  })

  it('builds the FAQ list from the question_N/answer_N fields', () => {
    const acf = makeAcf({
      faq_label: 'Dudas frecuentes',
      question_1: '¿Pregunta uno?',
      answer_1: 'Respuesta uno.',
      question_2: '¿Pregunta dos?',
      answer_2: 'Respuesta dos.',
    })
    const result = parseTherapieAcf(acf)

    expect(result.faqLabel).toBe('Dudas frecuentes')
    expect(result.faqs).toEqual([
      { question: '¿Pregunta uno?', answer: 'Respuesta uno.' },
      { question: '¿Pregunta dos?', answer: 'Respuesta dos.' },
    ])
  })

  it('defaults the FAQ label to "Preguntas frecuentes" when not set', () => {
    const result = parseTherapieAcf(makeAcf())
    expect(result.faqLabel).toBe('Preguntas frecuentes')
  })

  it('drops incomplete FAQ pairs (missing question or answer)', () => {
    const acf = makeAcf({
      question_1: '¿Pregunta uno?',
      answer_1: 'Respuesta uno.',
      question_2: '¿Pregunta sin respuesta?',
      answer_2: '',
      question_3: '',
      answer_3: 'Respuesta sin pregunta.',
    })
    const result = parseTherapieAcf(acf)
    expect(result.faqs).toEqual([{ question: '¿Pregunta uno?', answer: 'Respuesta uno.' }])
  })
})
