import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

const push = vi.fn<(path: string) => void>()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

import { useInternalLinks } from '../useInternalLinks'

function makeHost(initialHtml: string) {
  return defineComponent({
    setup() {
      const containerRef = ref<HTMLElement | null>(null)
      useInternalLinks(containerRef)
      return { containerRef, initialHtml }
    },
    render() {
      return h('div', { ref: 'containerRef', innerHTML: this.initialHtml })
    },
  })
}

describe('useInternalLinks', () => {
  beforeEach(() => {
    push.mockReset()
  })

  it('intercepts clicks on internal links and navigates via router.push, preventing default', async () => {
    const wrapper = mount(makeHost('<a href="/pedir-cita">Pedir cita</a>'))
    await nextTick()

    const link = wrapper.find('a')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.element.dispatchEvent(event)

    expect(push).toHaveBeenCalledWith('/pedir-cita')
    expect(event.defaultPrevented).toBe(true)
  })

  it('ignores clicks on external links (does not call router.push or preventDefault)', async () => {
    const wrapper = mount(makeHost('<a href="https://example.com">External</a>'))
    await nextTick()

    const link = wrapper.find('a')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.element.dispatchEvent(event)

    expect(push).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('ignores clicks that do not target a link at all', async () => {
    const wrapper = mount(makeHost('<div><span>Not a link</span></div>'))
    await nextTick()

    const span = wrapper.find('span')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    span.element.dispatchEvent(event)

    expect(push).not.toHaveBeenCalled()
  })

  it('navigates when clicking a nested element inside the link (closest("a"))', async () => {
    const wrapper = mount(makeHost('<a href="/blog"><strong>Ir al blog</strong></a>'))
    await nextTick()

    const strong = wrapper.find('strong')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    strong.element.dispatchEvent(event)

    expect(push).toHaveBeenCalledWith('/blog')
  })

  it('intercepts same-origin absolute links (as produced by processWordPressContent for hand-typed relative hrefs)', async () => {
    const wrapper = mount(
      makeHost('<a href="https://kanbouripsicologia.com/politica-privacidad">Política</a>'),
    )
    await nextTick()

    const link = wrapper.find('a')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.element.dispatchEvent(event)

    expect(push).toHaveBeenCalledWith('/politica-privacidad')
    expect(event.defaultPrevented).toBe(true)
  })

  it('ignores clicks on links with target="_blank"', async () => {
    const wrapper = mount(makeHost('<a href="/pedir-cita" target="_blank">Pedir cita</a>'))
    await nextTick()

    const link = wrapper.find('a')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.element.dispatchEvent(event)

    expect(push).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('ignores clicks with a modifier key held (opening in a new tab)', async () => {
    const wrapper = mount(makeHost('<a href="/pedir-cita">Pedir cita</a>'))
    await nextTick()

    const link = wrapper.find('a')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })
    link.element.dispatchEvent(event)

    expect(push).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('removes the click listener on unmount', async () => {
    const wrapper = mount(makeHost('<a href="/pedir-cita">Pedir cita</a>'))
    await nextTick()
    const el = wrapper.find('a').element as HTMLElement
    wrapper.unmount()

    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    el.dispatchEvent(event)
    expect(push).not.toHaveBeenCalled()
  })
})
