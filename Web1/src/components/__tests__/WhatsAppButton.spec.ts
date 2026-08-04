import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WhatsAppButton from '../WhatsAppButton.vue'

describe('WhatsAppButton', () => {
  it('links to wa.me with the real phone number and a friendly prefilled message', () => {
    const wrapper = mount(WhatsAppButton)

    const link = wrapper.get('a')
    expect(link.attributes('href')).toMatch(/^https:\/\/wa\.me\/34629538062\?text=/)
    expect(decodeURIComponent(link.attributes('href')!)).toContain(
      'me gustaría más información sobre las terapias',
    )
  })

  it('opens in a new tab safely', () => {
    const wrapper = mount(WhatsAppButton)

    const link = wrapper.get('a')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
    expect(link.attributes('rel')).toContain('noreferrer')
  })

  it('has an accessible label', () => {
    const wrapper = mount(WhatsAppButton)
    expect(wrapper.get('a').attributes('aria-label')).toMatch(/whatsapp/i)
  })
})
