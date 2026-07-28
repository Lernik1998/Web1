<script setup lang="ts">
import FaqAccordion from '../../../components/FaqAccordion.vue'

defineOptions({
  name: 'AutoestimaView',
})

const cuandoAyuda = [
  'Autocrítica constante o sensación de «no ser suficiente»',
  'Dificultad para poner límites o decir que no',
  'Comparación continua con los demás',
  'Inseguridad en las relaciones o en el trabajo',
  'Necesidad de aprobación externa constante',
]

const beneficios = [
  'Una relación más amable contigo mismo/a',
  'Herramientas para poner límites',
  'Menos dependencia de la validación externa',
  'Más seguridad en tus decisiones',
]

const faqs = [
  {
    question: '¿La autoestima se puede trabajar en terapia?',
    answer:
      'Sí, es uno de los procesos más habituales. Trabajamos el origen de esa autocrítica y construimos, paso a paso, una mirada más amable hacia ti mismo/a.',
  },
  {
    question: '¿Cuánto tiempo lleva ver cambios?',
    answer: 'Los primeros cambios suelen notarse en pocas semanas, aunque consolidarlos lleva su tiempo.',
  },
  {
    question: '¿Sirve si el problema es de siempre, no algo puntual?',
    answer:
      'Sí, de hecho es habitual trabajar patrones de larga duración; el proceso puede requerir algo más de tiempo, pero funciona igual.',
  },
]
</script>

<template>
  <section class="kb-therapy">
    <div class="kb-therapy__header">
      <h1 class="kb-therapy__title text-h1">Autoestima y desarrollo personal</h1>
      <p class="kb-therapy__lead text-body">
        Un espacio para trabajar la relación contigo mismo/a: cómo te hablas,
        cómo te tratas y cómo te posicionas frente a los demás.
      </p>
    </div>

    <div class="kb-therapy__card">
      <div class="kb-therapy__block" v-animate-on-scroll>
        <h2 class="text-h2">¿Cuándo puede ayudar la terapia?</h2>
        <ul class="kb-therapy__list">
          <li v-for="item in cuandoAyuda" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="kb-therapy__block" v-animate-on-scroll>
        <h2 class="text-h2">Cómo trabajamos</h2>
        <p class="text-body">
          Trabajamos para identificar y transformar esa voz interna crítica,
          reconociendo tu valor y construyendo, paso a paso, una relación más
          amable contigo mismo/a.
        </p>
      </div>

      <div class="kb-therapy__block" v-animate-on-scroll>
        <h2 class="text-h2">Qué te llevas del proceso</h2>
        <ul class="kb-therapy__list">
          <li v-for="item in beneficios" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="kb-therapy__block" v-animate-on-scroll>
        <h2 class="text-h2">Preguntas frecuentes</h2>
        <div class="kb-therapy__faq">
          <FaqAccordion :items="faqs" />
        </div>
      </div>
    </div>

    <div class="kb-therapy__final">
      <router-link
        :to="{ path: '/pedir-cita', query: { servicio: 'adultos' } }"
        class="kb-therapy__cta text-cta"
      >
        Pedir cita
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.kb-therapy {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-therapy__header {
  max-width: 640px;
  margin: 0 auto 48px;
  text-align: center;
}

.kb-therapy__title {
  margin-bottom: 14px;
}

.kb-therapy__lead {
  color: var(--color-ink);
}

.kb-therapy__card {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.kb-therapy__block {
  text-align: center;
  padding: clamp(28px, 4vw, 40px) 0;
}

.kb-therapy__block.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base);
}

.kb-therapy__block.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.kb-therapy__block + .kb-therapy__block {
  border-top: 1px solid var(--color-line);
}

.kb-therapy__block:first-child {
  padding-top: 0;
}

.kb-therapy__block:last-child {
  padding-bottom: 0;
}

.kb-therapy__block h2 {
  margin-bottom: 14px;
}

.kb-therapy__block p {
  max-width: 56ch;
  margin: 0 auto;
  line-height: 1.65;
}

.kb-therapy__list {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  max-width: 46ch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.kb-therapy__list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
  text-align: left;
}

.kb-therapy__list li::before {
  content: '';
  flex-shrink: 0;
  margin-top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-rose);
}

.kb-therapy__faq {
  max-width: 56ch;
  margin: 0 auto;
}

.kb-therapy__final {
  text-align: center;
  margin-top: clamp(40px, 6vw, 56px);
}

.kb-therapy__cta {
  display: inline-flex;
  align-items: center;
  padding: 13px 30px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

.kb-therapy__cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}
</style>
