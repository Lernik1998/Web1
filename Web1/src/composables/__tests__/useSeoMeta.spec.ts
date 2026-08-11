import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/terapias/adultos/ansiedad' }),
}))

import { useSeoMeta, seoMetaFromYoast, type SeoMetaInput } from '../useSeoMeta'

function makeHost(source: ReturnType<typeof ref<SeoMetaInput | null>>) {
  return defineComponent({
    setup() {
      useSeoMeta(source)
      return () => h('div')
    },
  })
}

function clearHead() {
  document.title = ''
  document.head
    .querySelectorAll('meta[name], meta[property], link[rel="canonical"]')
    .forEach((el) => el.remove())
}

describe('useSeoMeta', () => {
  beforeEach(() => {
    clearHead()
  })

  afterEach(() => {
    clearHead()
  })

  it('does nothing while the source is null (data not loaded yet)', () => {
    mount(makeHost(ref(null)))

    expect(document.title).toBe('')
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
  })

  it('sets title, description, canonical and Open Graph tags once data arrives', async () => {
    const source = ref<SeoMetaInput | null>(null)
    mount(makeHost(source))

    source.value = { title: 'Ansiedad', description: 'Terapia para la ansiedad en Dénia.' }
    await nextTick()

    expect(document.title).toBe('Ansiedad | Kanbouri Psicología')
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Terapia para la ansiedad en Dénia.',
    )
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://kanbouripsicologia.com/terapias/adultos/ansiedad',
    )
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Ansiedad | Kanbouri Psicología',
    )
    expect(document.head.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe(
      'website',
    )
    expect(
      document.head.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toContain('index, follow')
  })

  it('uses a custom siteName as the title suffix, but leaves og:site_name as the business name', async () => {
    const source = ref<SeoMetaInput | null>({
      title: 'Psicólogo en Dénia',
      description: 'Psicología en Dénia y la Marina Alta.',
      siteName: 'María B. Kanbouri',
    })
    mount(makeHost(source))
    await nextTick()

    expect(document.title).toBe('Psicólogo en Dénia | María B. Kanbouri')
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Psicólogo en Dénia | María B. Kanbouri',
    )
    expect(document.head.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe(
      'Kanbouri Psicología',
    )
  })

  it('uses fullTitle verbatim (e.g. from Yoast SEO), without appending any suffix', async () => {
    const source = ref<SeoMetaInput | null>({
      fullTitle: 'Psicóloga en Dénia | Maria B. Kanbouri',
      description: 'Ya escrito en WordPress.',
      // Si llegaran los dos a la vez, fullTitle debe ganar sin más.
      title: 'Este título no debería usarse',
      siteName: 'Tampoco este sufijo',
    })
    mount(makeHost(source))
    await nextTick()

    expect(document.title).toBe('Psicóloga en Dénia | Maria B. Kanbouri')
    expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Psicóloga en Dénia | Maria B. Kanbouri',
    )
  })

  it('marks the page as noindex when requested (e.g. 404)', async () => {
    const source = ref<SeoMetaInput | null>({
      title: 'No encontrada',
      description: 'Página no encontrada.',
      noindex: true,
    })
    mount(makeHost(source))
    await nextTick()

    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    )
  })

  it('updates existing tags in place instead of duplicating them on change', async () => {
    const source = ref<SeoMetaInput | null>({ title: 'Uno', description: 'Descripción uno.' })
    mount(makeHost(source))
    await nextTick()

    source.value = { title: 'Dos', description: 'Descripción dos.' }
    await nextTick()

    expect(document.title).toBe('Dos | Kanbouri Psicología')
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
  })
})

describe('seoMetaFromYoast', () => {
  it('returns null while there is no title yet (data not loaded)', () => {
    expect(seoMetaFromYoast(null)).toBeNull()
    expect(seoMetaFromYoast(undefined)).toBeNull()
    expect(seoMetaFromYoast({})).toBeNull()
  })

  it('uses the explicit meta description when Yoast has one', () => {
    expect(
      seoMetaFromYoast({
        title: 'Psicóloga en Dénia | Maria B. Kanbouri',
        description: 'Descripción escrita a mano en Yoast.',
        og_description: 'Una distinta, generada automáticamente.',
      }),
    ).toEqual({
      fullTitle: 'Psicóloga en Dénia | Maria B. Kanbouri',
      description: 'Descripción escrita a mano en Yoast.',
    })
  })

  it('falls back to og_description when no explicit meta description was set in Yoast', () => {
    // Caso real: varias fichas en WordPress tienen título en Yoast pero
    // nunca se rellenó a mano la meta-descripción -- solo existe la que
    // Yoast genera siempre a partir del extracto (og_description).
    expect(
      seoMetaFromYoast({
        title: 'Aviso Legal | Kanbouri Psicología',
        og_description: 'Generada automáticamente a partir del contenido.',
      }),
    ).toEqual({
      fullTitle: 'Aviso Legal | Kanbouri Psicología',
      description: 'Generada automáticamente a partir del contenido.',
    })
  })

  it('returns null when there is a title but no description of any kind', () => {
    expect(seoMetaFromYoast({ title: 'Solo título' })).toBeNull()
  })
})
