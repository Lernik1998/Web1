import type { Directive } from 'vue'

/**
 * v-ripple: onda expansiva desde el punto de clic, inspirada en el efecto
 * "ripple" de PrimeVue/Material. Reimplementado sin dependencias: un <span>
 * se crea, anima y se elimina solo al terminar.
 */
function createRipple(event: MouseEvent) {
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)

  const circle = document.createElement('span')
  circle.className = 'kb-ripple__circle'
  circle.style.width = circle.style.height = `${size}px`
  circle.style.left = `${event.clientX - rect.left - size / 2}px`
  circle.style.top = `${event.clientY - rect.top - size / 2}px`

  el.appendChild(circle)
  circle.addEventListener('animationend', () => circle.remove())
}

export const ripple: Directive<HTMLElement> = {
  mounted(el) {
    el.classList.add('kb-ripple')
    el.addEventListener('click', createRipple)
  },
  unmounted(el) {
    el.removeEventListener('click', createRipple)
  },
}
