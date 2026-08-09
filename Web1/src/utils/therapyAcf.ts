import type { TherapieAcf } from '../types/api'

export interface TherapyBlock {
  title: string
  type: 'list' | 'text'
  items: string[]
  text: string
}

export interface TherapyFaqItem {
  question: string
  answer: string
}

export interface ParsedTherapyContent {
  intro: string
  blocks: TherapyBlock[]
  faqLabel: string
  faqs: TherapyFaqItem[]
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function splitIntoListItems(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * El custom post type "therapie" no guarda el contenido en `content.rendered`
 * (solo trae el botón de "Pedir cita"): la introducción, los bloques y sus
 * listas viven en campos ACF de texto plano, con saltos de línea `\r\n` como
 * separador entre elementos de lista.
 */
export function parseTherapieAcf(acf: TherapieAcf): ParsedTherapyContent {
  // Hasta 3 pares pregunta/respuesta (campos `question_N`/`answer_N`); se
  // descarta cualquier par sin pregunta o sin respuesta en vez de mostrar
  // una entrada vacía en el acordeón.
  const faqPairs = [
    { question: acf.question_1, answer: acf.answer_1 },
    { question: acf.question_2, answer: acf.answer_2 },
    { question: acf.question_3, answer: acf.answer_3 },
  ]
  const faqs = faqPairs
    .map(({ question, answer }) => ({
      question: (question ?? '').trim(),
      answer: (answer ?? '').trim(),
    }))
    .filter((item) => item.question && item.answer)

  return {
    intro: collapseWhitespace(acf.therapy_description ?? ''),
    blocks: [
      {
        title: (acf.when_title ?? '').trim(),
        type: 'list',
        items: splitIntoListItems(acf.when_items ?? ''),
        text: '',
      },
      {
        title: (acf.how_title ?? '').trim(),
        type: 'text',
        items: [],
        text: collapseWhitespace(acf.how_description ?? ''),
      },
      {
        title: (acf.benefits_title ?? '').trim(),
        type: 'list',
        items: splitIntoListItems(acf.benefits_items ?? ''),
        text: '',
      },
    ],
    faqLabel: (acf.faq_label ?? '').trim() || 'Preguntas frecuentes',
    faqs,
  }
}
