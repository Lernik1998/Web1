import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '../../router'
import MaintenanceView from '../MaintenanceView.vue'

const globalStubs = {
  directives: { 'animate-on-scroll': {}, spotlight: {}, ripple: {} },
  plugins: [router],
}

describe('MaintenanceView', () => {
  it('renders the maintenance message and real contact details', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(MaintenanceView, { global: globalStubs })

    expect(wrapper.text()).toContain('Estamos mejorando la web')
    expect(wrapper.find('a[href="tel:+34629538062"]').exists()).toBe(true)
    expect(wrapper.find('a[href="mailto:gabinete@kanbouripsicologia.com"]').exists()).toBe(true)

    const whatsappLink = wrapper.find('a[href^="https://wa.me/34629538062"]')
    expect(whatsappLink.exists()).toBe(true)
    expect(whatsappLink.attributes('target')).toBe('_blank')
  })

  it('marks the page as noindex', async () => {
    await router.push('/')
    await router.isReady()

    mount(MaintenanceView, { global: globalStubs })
    await new Promise((resolve) => setTimeout(resolve, 0))

    const robotsMeta = document.querySelector('meta[name="robots"]')
    expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow')
  })
})
