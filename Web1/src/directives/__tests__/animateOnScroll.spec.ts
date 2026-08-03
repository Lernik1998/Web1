import { describe, it, expect, vi, beforeAll } from 'vitest'
import type { ObjectDirective } from 'vue'

type ObserverCallback = (entries: Array<{ isIntersecting: boolean; target: Element }>) => void

let lastInstance: FakeIntersectionObserver | null = null

class FakeIntersectionObserver {
  callback: ObserverCallback
  observed: Set<Element> = new Set()
  constructor(callback: ObserverCallback) {
    this.callback = callback
    setLastInstance(this)
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

function setLastInstance(instance: FakeIntersectionObserver) {
  lastInstance = instance
}

beforeAll(() => {
  // jsdom doesn't implement IntersectionObserver; stub a minimal fake before
  // the directive module (which constructs one at import time) is loaded.
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
})

// The directive is typed as `Directive<HTMLElement>`, a union that also
// includes the plain-function-directive shape, so TS won't let us access
// `.mounted`/`.unmounted` directly. We know (and assert via behavior) that
// this particular directive is always the object form.
function asObjectDirective(directive: unknown) {
  return directive as Required<ObjectDirective<HTMLElement>>
}

describe('animateOnScroll directive', () => {
  it('adds the base class and observes the element on mount', async () => {
    const animateOnScroll = asObjectDirective((await import('../animateOnScroll')).animateOnScroll)
    const el = document.createElement('div')
    animateOnScroll.mounted(el, { modifiers: {} } as never, null as never, null as never)

    expect(el.classList.contains('kb-animate-onscroll')).toBe(true)
    expect(lastInstance?.observed.has(el)).toBe(true)
  })

  it('adds "is-visible" and stops observing (non-repeat) once intersecting', async () => {
    const animateOnScroll = asObjectDirective((await import('../animateOnScroll')).animateOnScroll)
    const el = document.createElement('div')
    animateOnScroll.mounted(el, { modifiers: {} } as never, null as never, null as never)

    lastInstance!.trigger(el, true)

    expect(el.classList.contains('is-visible')).toBe(true)
    expect(lastInstance!.observed.has(el)).toBe(false)
  })

  it('keeps observing and toggles "is-visible" off when leaving the viewport with .repeat', async () => {
    const animateOnScroll = asObjectDirective((await import('../animateOnScroll')).animateOnScroll)
    const el = document.createElement('div')
    animateOnScroll.mounted(el, { modifiers: { repeat: true } } as never, null as never, null as never)

    lastInstance!.trigger(el, true)
    expect(el.classList.contains('is-visible')).toBe(true)
    // With .repeat the element stays observed even after becoming visible.
    expect(lastInstance!.observed.has(el)).toBe(true)

    lastInstance!.trigger(el, false)
    expect(el.classList.contains('is-visible')).toBe(false)
  })

  it('unobserves the element on unmount without throwing', async () => {
    const animateOnScroll = asObjectDirective((await import('../animateOnScroll')).animateOnScroll)
    const el = document.createElement('div')
    animateOnScroll.mounted(el, { modifiers: {} } as never, null as never, null as never)
    expect(() => animateOnScroll.unmounted(el, {} as never, null as never, null as never)).not.toThrow()
    expect(lastInstance!.observed.has(el)).toBe(false)
  })
})
