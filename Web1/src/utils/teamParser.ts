export interface ParsedTeamMember {
  slug: string
  name: string
  role: string
  photo: string | null
  bio: string[]
  formacionAcademica: string[]
  formacionExtra: string[]
}

const DIACRITICS_RANGE = new RegExp('[̀-ͯ]', 'g')

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(DIACRITICS_RANGE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isPureStrongParagraph(el: Element): boolean {
  return (
    el.tagName === 'P' &&
    el.children.length === 1 &&
    el.children[0]?.tagName === 'STRONG' &&
    !!el.textContent?.trim()
  )
}

function isLabelParagraph(el: Element | undefined, keyword: string): boolean {
  if (!el || el.tagName !== 'P') return false
  return (el.textContent ?? '').toLowerCase().includes(keyword)
}

/**
 * La página "team" de WordPress no modela cada profesional como un bloque
 * propio: es un único chorro de <p>/<ul> donde cada ficha sigue siempre el
 * mismo patrón (nombre, cargo, párrafos de biografía, "Formación académica"
 * + lista, "Formación extracurricular" + lista). Lo parseamos así en vez de
 * depender de una estructura HTML que WordPress no ofrece.
 */
export function parseTeamContent(html: string): ParsedTeamMember[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const children = [...doc.body.children].filter(
    (el) => el.tagName === 'FIGURE' || (el.textContent ?? '').trim() !== '',
  )

  const members: ParsedTeamMember[] = []
  const slugCounts = new Map<string, number>()

  let i = 0
  while (i < children.length) {
    const nameEl = children[i]
    const roleEl = children[i + 1]
    // El nombre suele ir en negrita ("team"), pero en alguna página (p. ej.
    // "Sobre mí") solo el cargo lleva negrita y el nombre va en texto
    // normal. Aceptamos el bloque si cualquiera de los dos lo está.
    const nameIsBold = nameEl ? isPureStrongParagraph(nameEl) : false
    const roleIsBold = roleEl ? isPureStrongParagraph(roleEl) : false
    if (!nameEl || nameEl.tagName !== 'P' || !(nameEl.textContent ?? '').trim()) {
      i++
      continue
    }
    if (!nameIsBold && !roleIsBold) {
      i++
      continue
    }

    const name = (nameEl.textContent ?? '').trim()
    const role = roleIsBold ? (roleEl!.textContent ?? '').trim() : ''
    i += role ? 2 : 1

    const bio: string[] = []
    let photo: string | null = null
    while (i < children.length) {
      const el = children[i]
      if (!el) break
      if (isPureStrongParagraph(el) || isLabelParagraph(el, 'formación')) break

      // Algunas fichas (p. ej. "Sobre mí") incrustan la foto de la
      // profesional como una <figure> en medio del texto de biografía.
      if (el.tagName === 'FIGURE') {
        photo = photo ?? el.querySelector('img')?.getAttribute('src') ?? null
        i++
        continue
      }

      if (el.tagName !== 'P') break

      const text = (el.textContent ?? '').trim()
      if (text) bio.push(text)
      i++
    }

    let formacionAcademica: string[] = []
    if (isLabelParagraph(children[i], 'académica') || isLabelParagraph(children[i], 'academica')) {
      i++
      if (children[i]?.tagName === 'UL') {
        formacionAcademica = [...children[i]!.querySelectorAll('li')].map((li) =>
          (li.textContent ?? '').trim(),
        )
        i++
      }
    }

    let formacionExtra: string[] = []
    if (isLabelParagraph(children[i], 'extracurricular')) {
      i++
      if (children[i]?.tagName === 'UL') {
        formacionExtra = [...children[i]!.querySelectorAll('li')].map((li) =>
          (li.textContent ?? '').trim(),
        )
        i++
      }
    }

    const baseSlug = slugify(name) || 'profesional'
    const count = slugCounts.get(baseSlug) ?? 0
    slugCounts.set(baseSlug, count + 1)
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`

    members.push({ slug, name, role, photo, bio, formacionAcademica, formacionExtra })
  }

  return members
}
