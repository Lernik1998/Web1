import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FaqAccordion from '../FaqAccordion.vue'

const items = [
  { question: '¿Cómo pido cita?', answer: 'Escríbenos por email o teléfono.' },
  { question: '¿Hacéis terapia online?', answer: 'Sí, ofrecemos sesiones online.' },
  { question: '¿Cuánto dura una sesión?', answer: 'Cada sesión dura 50 minutos.' },
]

describe('FaqAccordion', () => {
  it('renders all questions and opens the first item by default', () => {
    const wrapper = mount(FaqAccordion, { props: { items } })

    const questions = wrapper.findAll('.kb-faq__question')
    expect(questions).toHaveLength(3)
    expect(questions[0]!.attributes('aria-expanded')).toBe('true')
    expect(questions[1]!.attributes('aria-expanded')).toBe('false')

    const answerWrappers = wrapper.findAll('.kb-faq__answer-wrapper')
    expect(answerWrappers[0]!.classes()).toContain('is-open')
    expect(answerWrappers[1]!.classes()).not.toContain('is-open')
  })

  it('toggles an answer open when its question is clicked', async () => {
    const wrapper = mount(FaqAccordion, { props: { items } })

    const questions = wrapper.findAll('.kb-faq__question')
    await questions[1]!.trigger('click')

    expect(questions[1]!.attributes('aria-expanded')).toBe('true')
    // clicking a different question closes the previously open one
    expect(questions[0]!.attributes('aria-expanded')).toBe('false')

    const answerWrappers = wrapper.findAll('.kb-faq__answer-wrapper')
    expect(answerWrappers[1]!.classes()).toContain('is-open')
  })

  it('closes an open answer when clicked again', async () => {
    const wrapper = mount(FaqAccordion, { props: { items } })

    const questions = wrapper.findAll('.kb-faq__question')
    // first item starts open; click it to close
    await questions[0]!.trigger('click')

    expect(questions[0]!.attributes('aria-expanded')).toBe('false')
    const answerWrappers = wrapper.findAll('.kb-faq__answer-wrapper')
    expect(answerWrappers[0]!.classes()).not.toContain('is-open')
  })
})
