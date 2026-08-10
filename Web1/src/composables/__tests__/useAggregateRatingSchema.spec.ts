import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { useAggregateRatingSchema, type AggregateRatingInput } from '../useAggregateRatingSchema'

const BASE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: 'Kanbouri Psicología',
}

function makeHost(source: ReturnType<typeof ref<AggregateRatingInput | null>>) {
  return defineComponent({
    setup() {
      useAggregateRatingSchema(source)
      return () => h('div')
    },
  })
}

function getSchema() {
  const el = document.getElementById('kb-business-schema')
  return el ? JSON.parse(el.textContent ?? 'null') : null
}

function installBaseScript() {
  const script = document.createElement('script')
  script.id = 'kb-business-schema'
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(BASE_SCHEMA)
  document.head.appendChild(script)
}

describe('useAggregateRatingSchema', () => {
  beforeEach(() => {
    document.getElementById('kb-business-schema')?.remove()
    installBaseScript()
  })

  afterEach(() => {
    document.getElementById('kb-business-schema')?.remove()
  })

  it('does not add aggregateRating while there is no rating data', () => {
    mount(makeHost(ref(null)))
    expect(getSchema()).toEqual(BASE_SCHEMA)
  })

  it('adds a real aggregateRating computed from the live reviews, without touching the rest of the schema', async () => {
    const source = ref<AggregateRatingInput | null>(null)
    mount(makeHost(source))

    source.value = { ratingValue: 5, reviewCount: 10 }
    await nextTick()

    const schema = getSchema()
    expect(schema.name).toBe('Kanbouri Psicología')
    expect(schema.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 5,
      reviewCount: 10,
    })
  })

  it('does not add aggregateRating when reviewCount is 0', async () => {
    const source = ref<AggregateRatingInput | null>(null)
    mount(makeHost(source))

    source.value = { ratingValue: 0, reviewCount: 0 }
    await nextTick()

    expect(getSchema().aggregateRating).toBeUndefined()
  })

  it('removes aggregateRating when the component unmounts (page no longer shows the reviews)', async () => {
    const source = ref<AggregateRatingInput | null>({ ratingValue: 4.8, reviewCount: 6 })
    const wrapper = mount(makeHost(source))
    await nextTick()
    expect(getSchema().aggregateRating).toBeDefined()

    wrapper.unmount()
    expect(getSchema().aggregateRating).toBeUndefined()
    // El resto del schema (id incluido, ya que es el mismo <script> que vive
    // en index.html) debe seguir intacto: no se elimina el bloque entero.
    expect(document.getElementById('kb-business-schema')).not.toBeNull()
    expect(getSchema().name).toBe('Kanbouri Psicología')
  })

  it('does nothing (does not throw) when the business schema script is missing from the page', () => {
    document.getElementById('kb-business-schema')?.remove()
    expect(() => mount(makeHost(ref({ ratingValue: 5, reviewCount: 3 })))).not.toThrow()
  })
})
