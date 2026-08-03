import { describe, it, expect, vi } from 'vitest'
import type { ObjectDirective } from 'vue'
import { spotlight as spotlightDirective } from '../spotlight'

// Typed as `Directive<HTMLElement>` (a union with the function-directive
// shape), so cast to the object form to access `.mounted`/`.unmounted`.
const spotlight = spotlightDirective as Required<ObjectDirective<HTMLElement>>

function makeEl(width = 200, height = 100) {
  const el = document.createElement('div')
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

describe('spotlight directive', () => {
  it('adds the kb-spotlight class on mount', () => {
    const el = makeEl()
    spotlight.mounted(el, {} as never, null as never, null as never)
    expect(el.classList.contains('kb-spotlight')).toBe(true)
  })

  it('sets --spot-x/--spot-y CSS custom properties as percentages on mousemove', () => {
    const el = makeEl(200, 100)
    spotlight.mounted(el, {} as never, null as never, null as never)

    const event = new MouseEvent('mousemove', { clientX: 50, clientY: 25, bubbles: true })
    el.dispatchEvent(event)

    expect(el.style.getPropertyValue('--spot-x')).toBe('25%')
    expect(el.style.getPropertyValue('--spot-y')).toBe('25%')
  })

  it('stops updating the custom properties after unmount', () => {
    const el = makeEl(200, 100)
    spotlight.mounted(el, {} as never, null as never, null as never)
    spotlight.unmounted(el, {} as never, null as never, null as never)

    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 50, bubbles: true })
    el.dispatchEvent(event)

    expect(el.style.getPropertyValue('--spot-x')).toBe('')
    expect(el.style.getPropertyValue('--spot-y')).toBe('')
  })
})
