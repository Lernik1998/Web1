import type { TherapieAcf } from '../types/api'

export interface TherapyBlock {
  title: string
  type: 'list' | 'text'
  items: string[]
  text: string
}

export interface ParsedTherapyContent {
  intro: string
  blocks: TherapyBlock[]
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
  }
}
