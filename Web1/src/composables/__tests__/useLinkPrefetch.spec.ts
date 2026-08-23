import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'

const { resolve, prefetchRouteMock } = vi.hoisted(() => ({
  resolve: vi.fn((path: string) => {
    if (path === '/terapias/adultos/ansiedad') {
      return { name: 'ansiedad', params: {} }
    }
    if (path === '/terapias/adultos/duelo') {
      return { name: 'duelo', params: {} }
    }
    if (path.startsWith('/equipo/')) {
      return { name: 'team-member', params: { slug: path.split('/')[2] } }
    }
    return { name: 'not-found', params: {} }
  }),
  prefetchRouteMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ resolve }),
}))

vi.mock('../../router/prefetch', () => ({
  prefetchRoute: prefetchRouteMock,
}))

type ObserverEntry = { isIntersecting: boolean; target: Element }
type ObserverCallback = (entries: ObserverEntry[]) => void

let lastIntersectionObserver: FakeIntersectionObserver | null = null

// jsdom no implementa IntersectionObserver; se simula uno mínimo, igual que
// ya se hace en directives/__tests__/animateOnScroll.spec.ts.
class FakeIntersectionObserver {
  callback: ObserverCallback
  observed = new Set<Element>()
  constructor(callback: ObserverCallback) {
    this.callback = callback
    lastIntersectionObserver = this
  }
  observe(target: Element) {
    this.observed.add(target)
  }
  unobserve(target: Element) {
    this.observed.delete(target)
  }
  disconnect() {
    this.observed.clear()
  }
  trigger(target: Element, isIntersecting: boolean) {
    this.callback([{ isIntersecting, target }])
  }
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  // jsdom tampoco implementa `requestIdleCallback` (ver useLinkPrefetch.ts,
  // que la usa para no competir con las peticiones críticas de la propia
  // página recién cargada): se simula ejecutando el callback en el acto,
  // para no tener que meter esperas artificiales en cada test.
  vi.stubGlobal('requestIdleCallback', (cb: IdleRequestCallback) => {
    cb({ didTimeout: false, timeRemaining: () => 50 })
    return 1
  })
  vi.stubGlobal('cancelIdleCallback', () => {})
})

import { useLinkPrefetch } from '../useLinkPrefetch'

function makeHost(html: string) {
  return defineComponent({
    setup() {
      useLinkPrefetch()
    },
    render() {
      return h('div', { innerHTML: html })
    },
  })
}

// El listener de `useLinkPrefetch` está en `document` (delegación de
// eventos), así que los elementos de cada test deben estar realmente
// insertados en el DOM del documento -- si no, "mouseover"/"focusin" no
// llegan a burbujear hasta `document` y el test no comprobaría nada real.
const mountOptions = { attachTo: document.body }

describe('useLinkPrefetch', () => {
  beforeEach(() => {
    resolve.mockClear()
    prefetchRouteMock.mockClear()
    lastIntersectionObserver = null
  })

  it('prefetches the resolved route on mouseover of an internal link', async () => {
    const wrapper = mount(makeHost('<a href="/terapias/adultos/ansiedad">Ansiedad</a>'), mountOptions)
    const link = wrapper.find('a')

    link.element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(prefetchRouteMock).toHaveBeenCalledWith('ansiedad', {})
    wrapper.unmount()
  })

  it('prefetches on focusin (keyboard navigation)', async () => {
    const wrapper = mount(makeHost('<a href="/equipo/beatriz-donet">Beatriz</a>'), mountOptions)
    const link = wrapper.find('a')

    link.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

    expect(prefetchRouteMock).toHaveBeenCalledWith('team-member', { slug: 'beatriz-donet' })
    wrapper.unmount()
  })

  it('prefetches on touchstart (mobile, fires before click)', async () => {
    const wrapper = mount(makeHost('<a href="/terapias/adultos/ansiedad">Ansiedad</a>'), mountOptions)
    const link = wrapper.find('a')

    link.element.dispatchEvent(new Event('touchstart', { bubbles: true }))

    expect(prefetchRouteMock).toHaveBeenCalledWith('ansiedad', {})
    wrapper.unmount()
  })

  it('only prefetches once per path, even with repeated hover events', async () => {
    const wrapper = mount(makeHost('<a href="/terapias/adultos/ansiedad">Ansiedad</a>'), mountOptions)
    const link = wrapper.find('a')

    link.element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    link.element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    link.element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(prefetchRouteMock).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('does not prefetch a route that resolves to the not-found catch-all', async () => {
    const wrapper = mount(makeHost('<a href="/no-existe">Nada</a>'), mountOptions)
    const link = wrapper.find('a')

    link.element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(prefetchRouteMock).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('ignores events that do not originate from inside a link', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          useLinkPrefetch()
        },
        render() {
          return h('div', [h('span', 'Not a link')])
        },
      }),
      mountOptions,
    )
    const span = wrapper.find('span')

    span.element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(prefetchRouteMock).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('ignores external links', async () => {
    const wrapper = mount(makeHost('<a href="https://example.com">External</a>'), mountOptions)
    const link = wrapper.find('a')

    link.element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(prefetchRouteMock).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('removes its listeners on unmount', async () => {
    const wrapper = mount(makeHost('<a href="/terapias/adultos/ansiedad">Ansiedad</a>'), mountOptions)
    const link = wrapper.find('a').element as HTMLElement
    wrapper.unmount()

    // El listener vive en `document` (delegación), así que basta con que el
    // elemento vuelva a estar insertado en el documento para comprobar de
    // verdad si el listener sigue activo o no -- si solo se despachara el
    // evento sobre el elemento ya desmontado (fuera del árbol), el test
    // pasaría igual aunque `useLinkPrefetch` nunca hubiera quitado nada.
    document.body.appendChild(link)
    link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(prefetchRouteMock).not.toHaveBeenCalled()
    link.remove()
  })

  // Cubre el caso límite de un click prácticamente instantáneo, sin pasar
  // antes el ratón por encima ni un segundo de por medio: en cuanto el
  // enlace es visible en pantalla, ya se ha lanzado su prefetch.
  describe('precarga por visibilidad (IntersectionObserver)', () => {
    it('prefetches a link as soon as it becomes visible, without any hover/focus/touch', async () => {
      const wrapper = mount(makeHost('<a href="/terapias/adultos/duelo">Duelo</a>'), mountOptions)
      const link = wrapper.find('a').element

      expect(lastIntersectionObserver).not.toBeNull()
      expect(prefetchRouteMock).not.toHaveBeenCalled()

      lastIntersectionObserver?.trigger(link, true)

      expect(prefetchRouteMock).toHaveBeenCalledWith('duelo', {})
      wrapper.unmount()
    })

    it('does not prefetch while the link has not intersected yet', async () => {
      const wrapper = mount(makeHost('<a href="/terapias/adultos/duelo">Duelo</a>'), mountOptions)
      const link = wrapper.find('a').element

      lastIntersectionObserver?.trigger(link, false)

      expect(prefetchRouteMock).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('stops observing a link once it has intersected (one-shot)', async () => {
      const wrapper = mount(makeHost('<a href="/terapias/adultos/duelo">Duelo</a>'), mountOptions)
      const link = wrapper.find('a').element

      lastIntersectionObserver?.trigger(link, true)

      expect(lastIntersectionObserver?.observed.has(link)).toBe(false)
      wrapper.unmount()
    })

    it('observes links added to the page later on (e.g. content loaded asynchronously)', async () => {
      const wrapper = mount(makeHost('<p>Sin enlaces todavía</p>'), mountOptions)

      const newLink = document.createElement('a')
      newLink.href = '/terapias/adultos/duelo'
      newLink.textContent = 'Duelo'
      wrapper.element.appendChild(newLink)

      // El MutationObserver reacciona de forma asíncrona a los cambios del
      // DOM (microtask), así que hace falta esperar un tick antes de que el
      // nuevo enlace quede observado.
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(lastIntersectionObserver?.observed.has(newLink)).toBe(true)
      wrapper.unmount()
    })
  })
})
