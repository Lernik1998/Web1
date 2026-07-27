import type { Directive } from 'vue'

/**
 * v-animate-on-scroll: añade la clase base al montar y "is-visible" cuando
 * el elemento entra en el viewport. Los componentes definen la animación
 * concreta (fade, translate...) en su propio <style scoped>.
 */
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }
  },
  { threshold: 0.15 },
)

export const animateOnScroll: Directive<HTMLElement> = {
  mounted(el) {
    el.classList.add('kb-animate-onscroll')
    observer.observe(el)
  },
  unmounted(el) {
    observer.unobserve(el)
  },
}
