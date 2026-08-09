export interface TeamBioSection {
  heading: string
  paragraphs: string[]
}

export interface ParsedTeamMember {
  slug: string
  name: string
  role: string
  photo: string | null
  /** Párrafos de biografía antes del primer subtítulo (<h2>/<h3>), si lo hay. */
  bio: string[]
  /** Tramos de biografía agrupados bajo cada subtítulo, en el orden en que aparecen. */
  sections: TeamBioSection[]
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

// Un párrafo "de etiqueta" (nombre, cargo) es TODO negrita, nada de texto
// normal de verdad alrededor: no basta con que tenga hijos <strong>, porque
// un párrafo de biografía normal que solo resalta una frase en negrita en
// mitad de una oración ("Soy Fulana, **psicóloga en Denia**, especializada
// en...") también tiene contenido en negrita, y sin esta comprobación se
// confundía con un verdadero separador de sección, cortando la biografía en
// ese punto.
//
// Se admiten VARIOS <strong> (no solo uno) y una pequeña cantidad de texto
// suelto entre ellos (hasta `LOOSE_TEXT_TOLERANCE` caracteres): al editar
// una tilde a mano ("Denia" -> "Dénia") es fácil que la letra nueva quede
// fuera de la negrita sin querer, partiendo un único <strong> en dos -- eso
// no debería bastar para que todo el cargo deje de reconocerse.
const LOOSE_TEXT_TOLERANCE = 2

function isPureStrongParagraph(el: Element): boolean {
  if (el.tagName !== 'P') return false
  const full = (el.textContent ?? '').trim()
  if (!full) return false

  const children = [...el.children]
  if (!children.length || !children.every((child) => child.tagName === 'STRONG')) return false

  const strongLength = children.reduce((sum, child) => sum + (child.textContent ?? '').length, 0)
  return full.length - strongLength <= LOOSE_TEXT_TOLERANCE
}

// Los títulos de sección ("Formación académica"...) pueden llegar como
// párrafo en negrita (convención antigua) o como un encabezado real de
// WordPress (<h2>/<h3>, al usar el bloque "Encabezado" del editor).
function isLabelParagraph(el: Element | undefined, keyword: string): boolean {
  if (!el) return false
  if (el.tagName !== 'P' && el.tagName !== 'H2' && el.tagName !== 'H3') return false
  return (el.textContent ?? '').toLowerCase().includes(keyword)
}

/**
 * Cuando la biografía se pega desde Word/Docs, WordPress convierte cada
 * salto de línea del documento original en un `<br>` dentro del mismo
 * `<p>`, sin distinguir un simple ajuste de línea de un cambio de párrafo
 * real. `el.textContent` ignora los `<br>`, así que la palabra final de una
 * línea queda pegada a la primera de la siguiente (p. ej. "...las personas.
 * Me" + "fascinaba..." se leía "Mefascinaba"). Aquí se reconstruyen las
 * líneas usando el `<br>` como separador y se detectan los párrafos reales:
 * una línea bastante más corta que el resto (ajuste natural de línea) que
 * además termina en punto/interrogación/exclamación es el final de un
 * párrafo; el resto son continuaciones del mismo párrafo.
 */
function extractBioParagraphs(el: Element): string[] {
  const lines: string[] = []
  let current = ''
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'BR') {
      lines.push(current.trim())
      current = ''
    } else {
      current += node.textContent ?? ''
    }
  })
  if (current.trim()) lines.push(current.trim())

  const nonEmptyLines = lines.filter(Boolean)
  if (nonEmptyLines.length <= 1) return nonEmptyLines

  const maxLength = Math.max(...nonEmptyLines.map((line) => line.length))
  const paragraphs: string[] = []
  let buffer: string[] = []
  nonEmptyLines.forEach((line, index) => {
    buffer.push(line)
    const isShortLine = line.length < maxLength * 0.75
    const endsSentence = /[.!?]$/.test(line)
    const isLastLine = index === nonEmptyLines.length - 1
    if (isLastLine || (isShortLine && endsSentence)) {
      paragraphs.push(buffer.join(' '))
      buffer = []
    }
  })
  if (buffer.length) paragraphs.push(buffer.join(' '))

  return paragraphs
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
    const sections: TeamBioSection[] = []
    // Mientras no se haya visto ningún subtítulo, los párrafos van a `bio`
    // (se muestran como intro, antes de cualquier encabezado). En cuanto
    // aparece un <h2>/<h3> intermedio, los siguientes párrafos se agrupan
    // bajo ese subtítulo en `sections`, en vez de perderse.
    let currentSection: TeamBioSection | null = null
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

      // Subtítulo intermedio dentro de la propia biografía (p. ej. "Mi
      // trayectoria como psicóloga en Dénia"), no una etiqueta de "Formación"
      // ni el nombre/cargo de otra ficha.
      if (el.tagName === 'H2' || el.tagName === 'H3') {
        const heading = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
        currentSection = heading ? { heading, paragraphs: [] } : null
        if (currentSection) sections.push(currentSection)
        i++
        continue
      }

      if (el.tagName !== 'P') break

      const paragraphs = extractBioParagraphs(el)
      if (currentSection) {
        currentSection.paragraphs.push(...paragraphs)
      } else {
        bio.push(...paragraphs)
      }
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

    // Un subtítulo sin ningún párrafo detrás (p. ej. dos <h2> seguidos) no
    // aporta nada que mostrar: se descarta en vez de dejar un encabezado
    // vacío en la página.
    const nonEmptySections = sections.filter((section) => section.paragraphs.length > 0)

    members.push({
      slug,
      name,
      role,
      photo,
      bio,
      sections: nonEmptySections,
      formacionAcademica,
      formacionExtra,
    })
  }

  return members
}
