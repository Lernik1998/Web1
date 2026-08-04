import type { ProfesionalAcf } from '../types/api'

export interface ParsedProfesional {
  role: string
  bio: string[]
  licenseNumber: string
  formacionAcademica: string[]
  formacionExtra: string[]
}

/**
 * Los campos de texto largo de ACF (`short_description`, `work_description`)
 * usan una línea en blanco (\r\n\r\n) para separar párrafos reales, pero
 * también traen saltos de línea sueltos que son solo el ajuste de línea del
 * editor de WordPress, no un párrafo nuevo — hay que "desenrollarlos" a un
 * espacio en vez de tratarlos como salto.
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, ' ').trim())
    .filter(Boolean)
}

// `academic_training`/`extra_training` son, en cambio, una lista con un
// elemento por línea (un solo salto de línea sí separa cada punto).
function splitIntoListItems(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function parseProfesionalAcf(acf: ProfesionalAcf): ParsedProfesional {
  return {
    role: (acf.position ?? '').trim(),
    bio: [
      ...splitIntoParagraphs(acf.short_description ?? ''),
      ...splitIntoParagraphs(acf.work_description ?? ''),
    ],
    licenseNumber: (acf.license_number ?? '').trim(),
    formacionAcademica: splitIntoListItems(acf.academic_training ?? ''),
    formacionExtra: splitIntoListItems(acf.extra_training ?? ''),
  }
}
