import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import NewsletterSignup from '../NewsletterSignup.vue'
import { subscribeToNewsletter } from '../../services/dataService'

vi.mock('../../services/dataService')

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }
const mockedSubscribe = vi.mocked(subscribeToNewsletter)

describe('NewsletterSignup', () => {
  beforeEach(() => {
    mockedSubscribe.mockReset()
  })

  it('shows a validation error and does not call the service on empty submit', async () => {
    mockedSubscribe.mockResolvedValue(undefined)

    const wrapper = mount(NewsletterSignup, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
    })

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.kb-newsletter__error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Falta completar')
    expect(mockedSubscribe).not.toHaveBeenCalled()

    const nameInput = wrapper.find('input[name="nombre"]')
    const emailInput = wrapper.find('input[name="email"]')
    const checkbox = wrapper.find('input[name="privacidad"]')
    expect(nameInput.classes()).toContain('is-invalid')
    expect(emailInput.classes()).toContain('is-invalid')
    expect(checkbox.classes()).toContain('is-invalid')
  })

  it('calls subscribeToNewsletter with the entered name and email on valid submit', async () => {
    mockedSubscribe.mockResolvedValue(undefined)

    const wrapper = mount(NewsletterSignup, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
    })

    await wrapper.find('input[name="nombre"]').setValue('Ana')
    await wrapper.find('input[name="email"]').setValue('ana@ejemplo.com')
    await wrapper.find('input[name="privacidad"]').setValue(true)

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockedSubscribe).toHaveBeenCalledWith('Ana', 'ana@ejemplo.com')
  })

  it('shows the success state after a resolved submission', async () => {
    mockedSubscribe.mockResolvedValue(undefined)

    const wrapper = mount(NewsletterSignup, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
    })

    await wrapper.find('input[name="nombre"]').setValue('Ana')
    await wrapper.find('input[name="email"]').setValue('ana@ejemplo.com')
    await wrapper.find('input[name="privacidad"]').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.kb-newsletter__success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Listo')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('shows an error message when the service call rejects', async () => {
    mockedSubscribe.mockRejectedValue(new Error('network error'))

    const wrapper = mount(NewsletterSignup, {
      global: { directives, stubs: { RouterLink: RouterLinkStub } },
    })

    await wrapper.find('input[name="nombre"]').setValue('Ana')
    await wrapper.find('input[name="email"]').setValue('ana@ejemplo.com')
    await wrapper.find('input[name="privacidad"]').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.kb-newsletter__success').exists()).toBe(false)
    expect(wrapper.text()).toContain('No se ha podido enviar la solicitud')
  })
})
