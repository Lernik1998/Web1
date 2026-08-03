import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../router'
import PedirCitaView from '../PedirCitaView.vue'

vi.mock('../../services/dataService')

import { fetchPedirCitaPage } from '../../services/dataService'

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
  })

  afterEach(() => {
    vi.useRealTimers()
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

    await vi.advanceTimersByTimeAsync(600)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.kb-appointment__success').exists()).toBe(true)
    expect(wrapper.text()).toContain('¡Solicitud enviada!')
    expect(wrapper.text()).toContain('Ana')
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
