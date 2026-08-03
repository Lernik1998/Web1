import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '../LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders three bouncing dots with no message by default', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.findAll('.dot')).toHaveLength(3)
    expect(wrapper.find('.loading-message').exists()).toBe(false)
  })

  it('renders the message when provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { message: 'Cargando reseñas...' },
    })

    expect(wrapper.find('.loading-message').exists()).toBe(true)
    expect(wrapper.text()).toContain('Cargando reseñas...')
  })
})
