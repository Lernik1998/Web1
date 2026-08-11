import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../router'
import PedirCitaView from '../PedirCitaView.vue'

vi.mock('../../services/dataService')
vi.mock('../../utils/recaptcha')

import { fetchPedirCitaPage, submitAppointmentRequest } from '../../services/dataService'
import { getRecaptchaToken } from '../../utils/recaptcha'

const globalStubs = {
  directives: { 'animate-on-scroll': {}, spotlight: {}, ripple: {} },
  plugins: [router],
}

async function mountView() {
  vi.mocked(fetchPedirCitaPage).mockResolvedValue(null)
  await router.push('/pedir-cita')
  await router.isReady()
  const wrapper = mount(PedirCitaView, { global: globalStubs })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return wrapper
}

async function fillRequiredFields(wrapper: Awaited<ReturnType<typeof mountView>>) {
  await wrapper.find('input[name="nombre"]').setValue('Ana')
  await wrapper.find('input[name="apellidos"]').setValue('García López')
  await wrapper.find('input[name="email"]').setValue('ana@ejemplo.com')
  await wrapper.find('input[name="telefono"]').setValue('600000000')
  await wrapper.find('select[name="servicio"]').setValue('adultos')
  await wrapper.find('input[name="modalidad"][value="online"]').setValue()
  await wrapper.find('input[name="dias"][value="lunes"]').setValue()
  await wrapper.find('input[name="horarios"][value="manana"]').setValue()
  await wrapper.find('input[name="privacidad"]').setValue(true)
  await wrapper.find('input[name="contacto"]').setValue(true)
}

describe('PedirCitaView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(getRecaptchaToken).mockResolvedValue(null)
    vi.mocked(submitAppointmentRequest).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.mocked(getRecaptchaToken).mockReset()
    vi.mocked(submitAppointmentRequest).mockReset()
  })

  it('shows validation errors and does not submit when the form is empty', async () => {
    const wrapper = await mountView()

    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Falta completar algún campo obligatorio')
    expect(wrapper.findAll('.kb-field-error').length).toBeGreaterThan(0)
    expect(wrapper.find('.kb-appointment__success').exists()).toBe(false)
  })

  it('submits successfully once all required fields and checkboxes are filled in', async () => {
    const wrapper = await mountView()

    await fillRequiredFields(wrapper)
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Falta completar algún campo obligatorio')

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.kb-appointment__success').exists()).toBe(true)
    expect(wrapper.text()).toContain('¡Solicitud enviada!')
    expect(wrapper.text()).toContain('Ana')
  })

  it('calls getRecaptchaToken with the pedir_cita action on submit', async () => {
    const wrapper = await mountView()

    await fillRequiredFields(wrapper)
    await wrapper.find('form').trigger('submit.prevent')

    expect(getRecaptchaToken).toHaveBeenCalledWith('pedir_cita')
  })

  it('sends the form data and the reCAPTCHA token to the backend', async () => {
    vi.mocked(getRecaptchaToken).mockResolvedValue('a-recaptcha-token')
    const wrapper = await mountView()

    await fillRequiredFields(wrapper)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(submitAppointmentRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ana',
        surname: 'García López',
        email: 'ana@ejemplo.com',
        phone: '600000000',
        therapy: 'Psicólogo para adultos',
        appointment_type: 'Online',
        weekdays: ['Lunes'],
        schedule: ['Mañana'],
        recaptcha_token: 'a-recaptcha-token',
      }),
    )
  })

  it('blocks submission with an error when reCAPTCHA verification fails', async () => {
    vi.mocked(getRecaptchaToken).mockRejectedValue(new Error('reCAPTCHA failed'))
    const wrapper = await mountView()

    await fillRequiredFields(wrapper)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.kb-appointment__success').exists()).toBe(false)
    expect(wrapper.text()).toContain('No se ha podido enviar la solicitud')
    expect(submitAppointmentRequest).not.toHaveBeenCalled()
  })

  it('blocks submission with an error when the backend rejects the request', async () => {
    vi.mocked(submitAppointmentRequest).mockRejectedValue(new Error('network error'))
    const wrapper = await mountView()

    await fillRequiredFields(wrapper)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.kb-appointment__success').exists()).toBe(false)
    expect(wrapper.text()).toContain('No se ha podido enviar la solicitud')
  })

  it('silently treats submission as successful when the honeypot field is filled (bot trap)', async () => {
    const wrapper = await mountView()

    await fillRequiredFields(wrapper)
    await wrapper.find('input[name="website"]').setValue('http://spam.example')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.kb-appointment__success').exists()).toBe(true)
    expect(getRecaptchaToken).not.toHaveBeenCalled()
  })

  it('disables Thursday/Friday and the afternoon slot when María is selected', async () => {
    const wrapper = await mountView()

    await wrapper.find('input[name="profesional"][value="maria"]').setValue()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('input[name="dias"][value="jueves"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('input[name="dias"][value="viernes"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('input[name="horarios"][value="tarde"]').attributes('disabled')).toBeDefined()
  })
})
