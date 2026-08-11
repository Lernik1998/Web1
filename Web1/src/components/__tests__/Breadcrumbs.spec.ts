import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '../../router'
import Breadcrumbs from '../Breadcrumbs.vue'

describe('Breadcrumbs', () => {
  it('renders every item as a real link except the last one, which is plain text', async () => {
    // La página actual real es la del último elemento de la miga de pan
    // (nunca uno de los anteriores): navegar aquí, no a "/", evita que
    // vue-router añada su propio "aria-current" automático a un enlace de
    // ruta activa y confunda ese caso con el nuestro.
    await router.push('/equipo/maria-b-kanbouri')
    await router.isReady()

    const wrapper = mount(Breadcrumbs, {
      props: {
        items: [
          { name: 'Inicio', path: '/' },
          { name: 'Equipo', path: '/equipo' },
          { name: 'María B. Kanbouri', path: '/equipo/maria-b-kanbouri' },
        ],
      },
      global: { plugins: [router] },
    })

    const links = wrapper.findAll('a')
    expect(links).toHaveLength(2)
    expect(links[0]?.attributes('href')).toBe('/')
    expect(links[1]?.attributes('href')).toBe('/equipo')

    const current = wrapper.find('.kb-breadcrumbs__current')
    expect(current.text()).toBe('María B. Kanbouri')
    expect(current.element.tagName).toBe('SPAN')
    expect(current.attributes('aria-current')).toBe('page')
  })
})
