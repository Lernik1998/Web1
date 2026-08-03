import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '../../router'
import NotFoundView from '../NotFoundView.vue'

const globalStubs = {
  directives: { 'animate-on-scroll': {}, spotlight: {}, ripple: {} },
  plugins: [router],
}

describe('NotFoundView', () => {
  it('renders the 404 message and navigation links', async () => {
    await router.push('/esta-ruta-no-existe')
    await router.isReady()

    const wrapper = mount(NotFoundView, { global: globalStubs })

    expect(wrapper.text()).toContain('404')
    expect(wrapper.text()).toContain('Esta página no existe')

    const links = wrapper.findAllComponents({ name: 'RouterLink' })
    const hrefs = links.map((link) => link.props('to'))
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/pedir-cita')
  })
})
