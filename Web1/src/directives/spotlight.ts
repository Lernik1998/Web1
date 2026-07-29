import type { Directive } from 'vue'

/**
 * v-spotlight: resplandor sutil que sigue al cursor sobre una tarjeta,
 * inspirado en el efecto "Spotlight Card" de React Bits, reimplementado
 * de forma nativa con CSS custom properties (sin dependencias externas).
 */
function handleMove(event: MouseEvent) {
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  el.style.setProperty('--spot-x', `${x}%`)
  el.style.setProperty('--spot-y', `${y}%`)
}

export const spotlight: Directive<HTMLElement> = {
  mounted(el) {
    el.classList.add('kb-spotlight')
    el.addEventListener('mousemove', handleMove)
  },
  unmounted(el) {
    el.removeEventListener('mousemove', handleMove)
  },
}
