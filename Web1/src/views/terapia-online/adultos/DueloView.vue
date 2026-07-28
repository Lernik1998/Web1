<script setup lang="ts">
import FaqAccordion from '../../../components/FaqAccordion.vue'

defineOptions({
  name: 'DueloView',
})

const cuandoAyuda = [
  'Pérdida de un ser querido',
  'Duelos no reconocidos: rupturas, mudanzas, pérdida de salud',
  'Sensación de bloqueo o de no poder «pasar página»',
  'Culpa, rabia o tristeza que no encuentran espacio',
  'Necesidad de acompañamiento en el proceso, a tu ritmo',
]

const beneficios = [
  'Un espacio para procesar la pérdida a tu ritmo',
  'Herramientas para integrar lo vivido',
  'Acompañamiento sin prisas ni plazos',
  'Recuperar poco a poco tu día a día',
]

const faqs = [
  {
    question: '¿Cuánto tiempo después de la pérdida puedo empezar terapia?',
    answer:
      'No hay un momento «correcto». Puedes empezar cuando sientas que lo necesitas, ya sea justo después o tiempo más tarde.',
  },
  {
    question: '¿Es normal sentir alivio o rabia además de tristeza?',
    answer:
      'Sí, el duelo incluye emociones muy diversas y a veces contradictorias. En terapia tienen cabida todas.',
  },
  {
    question: '¿Sirve para duelos que no son por una muerte?',
    answer: 'Sí, también acompañamos duelos por rupturas, pérdida de salud u otros cambios vitales importantes.',
  },
]
</script>

<template>
  <section class="kb-therapy">
    <div class="kb-therapy__header">
      <h1 class="kb-therapy__title text-h1">Duelo y pérdidas</h1>
      <p class="kb-therapy__lead text-body">
        Un espacio para acompañarte en el proceso de duelo, sea cual sea la
        pérdida, respetando siempre tu propio ritmo.
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
          Acompañamos el proceso de duelo desde el respeto y la escucha,
          ofreciendo un espacio donde poder sostener lo que sientes sin
          prisas, con herramientas que te ayuden a integrarlo poco a poco.
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
