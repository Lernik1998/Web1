import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '../LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders three bouncing dots with no message by default', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.findAll('.dot')).toHaveLength(3)
    expect(wrapper.find('.loading-message').exists()).toBe(false)
  })

  it('announces itself to assistive tech via role="status" and provides a hidden fallback text when there is no message', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(wrapper.find('.kb-visually-hidden').text()).toBe('Cargando…')
  })

  it('does not show the hidden fallback text when a message is provided (avoids announcing the loading state twice)', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { message: 'Cargando reseñas...' },
    })

    expect(wrapper.find('.kb-visually-hidden').exists()).toBe(false)
  })

  it('renders the message when provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { message: 'Cargando reseñas...' },
    })

    expect(wrapper.find('.loading-message').exists()).toBe(true)
    expect(wrapper.text()).toContain('Cargando reseñas...')
  })
})
