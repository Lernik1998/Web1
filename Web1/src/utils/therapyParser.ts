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

/**
 * Las páginas de terapias en WordPress son un único chorro de <p>/<h2>/<ul>:
 * un párrafo introductorio seguido de pares [título, contenido] (el título a
 * veces es <h2> y a veces un <p> normal, así que no distinguimos por
 * etiqueta, solo por posición).
 */
export function parseTherapyContent(html: string): ParsedTherapyContent {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const children = [...doc.body.children].filter((el) => (el.textContent ?? '').trim() !== '')

  const intro = (children[0]?.textContent ?? '').trim()

  const blocks: TherapyBlock[] = []
  let i = 1
  while (i < children.length) {
    const titleEl = children[i]
    if (!titleEl) break
    const title = (titleEl.textContent ?? '').trim()
    const contentEl = children[i + 1]

    if (contentEl?.tagName === 'UL') {
      const items = [...contentEl.querySelectorAll('li')].map((li) => (li.textContent ?? '').trim())
      blocks.push({ title, type: 'list', items, text: '' })
      i += 2
    } else if (contentEl?.tagName === 'P') {
      const text = (contentEl.textContent ?? '').trim()
      blocks.push({ title, type: 'text', items: [], text })
      i += 2
    } else {
      i += 1
    }
  }

  return { intro, blocks }
}
