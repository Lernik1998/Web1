import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '../../router'
import RelatedTherapies from '../RelatedTherapies.vue'

const globalStubs = {
  directives: { 'animate-on-scroll': {} },
  plugins: [router],
}

describe('RelatedTherapies', () => {
  it('renders a link for each item with the right label and destination', async () => {
    await router.push('/')
    await router.isReady()

    const links = [
      { label: 'Depresión y estado de ánimo', href: '/terapias/adultos/depresion' },
      { label: 'Autoestima y desarrollo personal', href: '/terapias/adultos/autoestima' },
    ]
    const wrapper = mount(RelatedTherapies, { props: { links }, global: globalStubs })

    expect(wrapper.text()).toContain('Terapias relacionadas')

    const routerLinks = wrapper.findAllComponents({ name: 'RouterLink' })
    expect(routerLinks).toHaveLength(2)
    expect(routerLinks.map((link) => link.props('to'))).toEqual([
      '/terapias/adultos/depresion',
      '/terapias/adultos/autoestima',
    ])
    expect(wrapper.text()).toContain('Depresión y estado de ánimo')
    expect(wrapper.text()).toContain('Autoestima y desarrollo personal')
  })
})
