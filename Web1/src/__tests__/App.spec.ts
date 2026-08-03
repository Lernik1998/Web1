import { describe, it, expect, vi } from 'vitest'

import { mount, flushPromises } from '@vue/test-utils'
import router from '../router'
import App from '../App.vue'

vi.mock('../services/dataService')

describe('App', () => {
  it('mounts the header, footer and the routed view without crashing', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        directives: { 'animate-on-scroll': {}, spotlight: {}, ripple: {} },
        plugins: [router],
      },
    })
    await flushPromises()

    expect(wrapper.findComponent({ name: 'Header' }).exists() || wrapper.find('header').exists()).toBe(
      true,
    )
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'Footer' }).exists() || wrapper.find('footer').exists()).toBe(
      true,
    )
  })
})
