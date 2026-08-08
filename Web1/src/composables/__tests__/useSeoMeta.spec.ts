import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/terapias/adultos/ansiedad' }),
}))

import { useSeoMeta, truncateForMeta, type SeoMetaInput } from '../useSeoMeta'

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

describe('truncateForMeta', () => {
  it('returns the text unchanged when it already fits', () => {
    expect(truncateForMeta('Texto corto.', 155)).toBe('Texto corto.')
  })

  it('cuts at the last whole word before the limit and adds an ellipsis', () => {
    const long = 'Palabra '.repeat(30).trim()
    const result = truncateForMeta(long, 50)

    expect(result.length).toBeLessThanOrEqual(51)
    expect(result.endsWith('…')).toBe(true)
    expect(result).not.toContain('Palabr…')
  })
})
