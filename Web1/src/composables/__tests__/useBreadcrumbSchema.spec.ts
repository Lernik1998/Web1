import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { useBreadcrumbSchema } from '../useBreadcrumbSchema'
import type { BreadcrumbItem } from '../../components/Breadcrumbs.vue'

function makeHost(source: ReturnType<typeof ref<BreadcrumbItem[] | null>>) {
  return defineComponent({
    setup() {
      useBreadcrumbSchema(source)
      return () => h('div')
    },
  })
}

function getSchema() {
  const el = document.getElementById('kb-breadcrumb-schema')
  return el ? JSON.parse(el.textContent ?? 'null') : null
}

describe('useBreadcrumbSchema', () => {
  beforeEach(() => {
    document.getElementById('kb-breadcrumb-schema')?.remove()
  })

  afterEach(() => {
    document.getElementById('kb-breadcrumb-schema')?.remove()
  })

  it('does not inject a script while there are no items', () => {
    mount(makeHost(ref(null)))
    expect(document.getElementById('kb-breadcrumb-schema')).toBeNull()
  })

  it('injects a valid BreadcrumbList schema, in order, with absolute URLs', async () => {
    const source = ref<BreadcrumbItem[] | null>(null)
    mount(makeHost(source))

    source.value = [
      { name: 'Inicio', path: '/' },
      { name: 'Equipo', path: '/equipo' },
      { name: 'María B. Kanbouri', path: '/equipo/maria-b-kanbouri' },
    ]
    await nextTick()

    const schema = getSchema()
    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://kanbouripsicologia.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Equipo',
        item: 'https://kanbouripsicologia.com/equipo',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'María B. Kanbouri',
        item: 'https://kanbouripsicologia.com/equipo/maria-b-kanbouri',
      },
    ])
  })

  it('reuses the same script tag instead of duplicating it on updates', async () => {
    const source = ref<BreadcrumbItem[] | null>([{ name: 'Inicio', path: '/' }])
    mount(makeHost(source))
    await nextTick()

    source.value = [
      { name: 'Inicio', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]
    await nextTick()

    expect(document.querySelectorAll('#kb-breadcrumb-schema')).toHaveLength(1)
    expect(getSchema().itemListElement).toHaveLength(2)
  })

  it('removes the script when the component unmounts', async () => {
    const source = ref<BreadcrumbItem[] | null>([{ name: 'Inicio', path: '/' }])
    const wrapper = mount(makeHost(source))
    await nextTick()
    expect(document.getElementById('kb-breadcrumb-schema')).not.toBeNull()

    wrapper.unmount()
    expect(document.getElementById('kb-breadcrumb-schema')).toBeNull()
  })
})
