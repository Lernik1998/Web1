import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { useFaqSchema, type FaqItem } from '../useFaqSchema'

function makeHost(source: ReturnType<typeof ref<FaqItem[] | null>>) {
  return defineComponent({
    setup() {
      useFaqSchema(source)
      return () => h('div')
    },
  })
}

function getSchema() {
  const el = document.getElementById('kb-faq-schema')
  return el ? JSON.parse(el.textContent ?? 'null') : null
}

describe('useFaqSchema', () => {
  beforeEach(() => {
    document.getElementById('kb-faq-schema')?.remove()
  })

  afterEach(() => {
    document.getElementById('kb-faq-schema')?.remove()
  })

  it('does not inject a script while there are no FAQs', () => {
    mount(makeHost(ref(null)))
    expect(document.getElementById('kb-faq-schema')).toBeNull()
  })

  it('injects a valid FAQPage schema once FAQs are available', async () => {
    const source = ref<FaqItem[] | null>(null)
    mount(makeHost(source))

    source.value = [{ question: '¿Cuánto dura la terapia?', answer: 'Depende del proceso.' }]
    await nextTick()

    const schema = getSchema()
    expect(schema['@type']).toBe('FAQPage')
    expect(schema.mainEntity).toHaveLength(1)
    expect(schema.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: '¿Cuánto dura la terapia?',
      acceptedAnswer: { '@type': 'Answer', text: 'Depende del proceso.' },
    })
  })

  it('reuses the same script tag instead of duplicating it on updates', async () => {
    const source = ref<FaqItem[] | null>([{ question: 'Uno', answer: 'Uno' }])
    mount(makeHost(source))
    await nextTick()

    source.value = [
      { question: 'Uno', answer: 'Uno' },
      { question: 'Dos', answer: 'Dos' },
    ]
    await nextTick()

    expect(document.querySelectorAll('#kb-faq-schema')).toHaveLength(1)
    expect(getSchema().mainEntity).toHaveLength(2)
  })

  it('removes the script when the component unmounts', async () => {
    const source = ref<FaqItem[] | null>([{ question: 'Uno', answer: 'Uno' }])
    const wrapper = mount(makeHost(source))
    await nextTick()
    expect(document.getElementById('kb-faq-schema')).not.toBeNull()

    wrapper.unmount()
    expect(document.getElementById('kb-faq-schema')).toBeNull()
  })
})
