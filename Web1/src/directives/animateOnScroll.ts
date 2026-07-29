import type { Directive } from 'vue'

/**
 * v-animate-on-scroll: añade la clase base al montar y "is-visible" cuando
 * el elemento entra en el viewport. Los componentes definen la animación
 * concreta (fade, translate...) en su propio <style scoped>.
 *
 * Modificador ".repeat" (inspirado en el AnimateOnScroll de PrimeVue): en
 * vez de animar solo una vez, quita "is-visible" al salir del viewport para
 * que la animación de entrada se repita cada vez que vuelva a aparecer.
 */
const repeatingTargets = new WeakSet<Element>()

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        if (!repeatingTargets.has(entry.target)) {
          observer.unobserve(entry.target)
        }
      } else if (repeatingTargets.has(entry.target)) {
        entry.target.classList.remove('is-visible')
      }
    }
  },
  { threshold: 0.15 },
)

export const animateOnScroll: Directive<HTMLElement> = {
  mounted(el, binding) {
    el.classList.add('kb-animate-onscroll')
    if (binding.modifiers.repeat) {
      repeatingTargets.add(el)
    }
    observer.observe(el)
  },
  unmounted(el) {
    observer.unobserve(el)
    repeatingTargets.delete(el)
  },
}
