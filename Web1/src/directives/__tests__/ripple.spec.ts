import { describe, it, expect, vi } from 'vitest'
import type { ObjectDirective } from 'vue'
import { ripple as rippleDirective } from '../ripple'

// Typed as `Directive<HTMLElement>` (a union with the function-directive
// shape), so cast to the object form to access `.mounted`/`.unmounted`.
const ripple = rippleDirective as Required<ObjectDirective<HTMLElement>>

function makeEl(width = 100, height = 40) {
  const el = document.createElement('button')
  document.body.appendChild(el)
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON() {},
  })
  return el
}

describe('ripple directive', () => {
  it('adds the kb-ripple class and a click listener on mount', () => {
    const el = makeEl()
    ripple.mounted(el, {} as never, null as never, null as never)
    expect(el.classList.contains('kb-ripple')).toBe(true)
  })

  it('creates a ripple circle span positioned at the click point on click', () => {
    const el = makeEl(100, 40)
    ripple.mounted(el, {} as never, null as never, null as never)

    const event = new MouseEvent('click', { clientX: 60, clientY: 20, bubbles: true })
    el.dispatchEvent(event)

    const circle = el.querySelector('.kb-ripple__circle')
    expect(circle).toBeTruthy()
    expect((circle as HTMLElement).style.width).toBe('100px')
    expect((circle as HTMLElement).style.height).toBe('100px')
  })

  it('removes the ripple circle when its animation ends', () => {
    const el = makeEl()
    ripple.mounted(el, {} as never, null as never, null as never)

    el.dispatchEvent(new MouseEvent('click', { clientX: 10, clientY: 10, bubbles: true }))
    const circle = el.querySelector('.kb-ripple__circle') as HTMLElement
    expect(circle).toBeTruthy()

    circle.dispatchEvent(new Event('animationend'))
    expect(el.querySelector('.kb-ripple__circle')).toBeNull()
  })

  it('stops creating ripples after unmount', () => {
    const el = makeEl()
    ripple.mounted(el, {} as never, null as never, null as never)
    ripple.unmounted(el, {} as never, null as never, null as never)

    el.dispatchEvent(new MouseEvent('click', { clientX: 10, clientY: 10, bubbles: true }))
    expect(el.querySelector('.kb-ripple__circle')).toBeNull()
  })
})
