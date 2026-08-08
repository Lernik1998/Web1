import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { usePersonSchema, type PersonSchemaInput } from '../usePersonSchema'

function makeHost(source: ReturnType<typeof ref<PersonSchemaInput | null>>) {
  return defineComponent({
    setup() {
      usePersonSchema(source)
      return () => h('div')
    },
  })
}

function getSchema() {
  const el = document.getElementById('kb-person-schema')
  return el ? JSON.parse(el.textContent ?? 'null') : null
}

describe('usePersonSchema', () => {
  beforeEach(() => {
    document.getElementById('kb-person-schema')?.remove()
  })

  afterEach(() => {
    document.getElementById('kb-person-schema')?.remove()
  })

  it('does not inject a script while there is no person data', () => {
    mount(makeHost(ref(null)))
    expect(document.getElementById('kb-person-schema')).toBeNull()
  })

  it('injects a Person schema including the license number as identifier', async () => {
    const source = ref<PersonSchemaInput | null>(null)
    mount(makeHost(source))

    source.value = {
      name: 'Ana García',
      jobTitle: 'Psicóloga infantil',
      licenseNumber: 'CV12345',
      url: 'https://kanbouripsicologia.com/equipo/ana-garcia',
    }
    await nextTick()

    const schema = getSchema()
    expect(schema['@type']).toBe('Person')
    expect(schema.name).toBe('Ana García')
    expect(schema.identifier).toBe('Colegiada nº CV12345')
    expect(schema.worksFor.name).toBe('Kanbouri Psicología')
  })

  it('omits the identifier field when there is no license number', async () => {
    const source = ref<PersonSchemaInput | null>({
      name: 'Ana García',
      url: 'https://kanbouripsicologia.com/equipo/ana-garcia',
    })
    mount(makeHost(source))
    await nextTick()

    expect(getSchema().identifier).toBeUndefined()
  })

  it('removes the script on unmount', async () => {
    const source = ref<PersonSchemaInput | null>({
      name: 'Ana García',
      url: 'https://kanbouripsicologia.com/equipo/ana-garcia',
    })
    const wrapper = mount(makeHost(source))
    await nextTick()
    expect(document.getElementById('kb-person-schema')).not.toBeNull()

    wrapper.unmount()
    expect(document.getElementById('kb-person-schema')).toBeNull()
  })
})
