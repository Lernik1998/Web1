<template>
  <section class="kb-therapy">
    <div class="kb-therapy__header">
      <h1 class="kb-therapy__title text-h1">Psicología para adultos</h1>
      <p class="kb-therapy__lead text-body">
        Terapia para gestionar ansiedad, duelo, autoestima o momentos de
        transición vital, siempre a tu ritmo.
      </p>
    </div>

    <div class="kb-therapy__card">
      <div class="kb-therapy__block" v-animate-on-scroll>
        <h2 class="text-h2">Áreas que trabajamos</h2>
        <div class="kb-pill-group">
          <router-link
            v-for="area in areas"
            :key="area.href"
            :to="area.href"
            class="kb-pill"
          >
            {{ area.label }}
          </router-link>
        </div>
      </div>

      <div class="kb-therapy__block" v-animate-on-scroll>
        <h2 class="text-h2">Cómo trabajamos</h2>
        <p class="text-body">
          Trabajamos desde un enfoque cercano y humano, donde el vínculo
          terapéutico es una pieza central del proceso: escucha sin juicio,
          presencia y respeto por el ritmo de cada persona.
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

      <div class="kb-therapy__block">
        <RelatedTherapies :links="relatedLinks" />
      </div>
    </div>

    <div class="kb-therapy__final">
      <router-link
        :to="{ path: '/pedir-cita', query: { servicio: 'adultos' } }"
        class="kb-therapy__cta kb-glare text-cta"
      >
        Pedir cita
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import FaqAccordion from '../../components/FaqAccordion.vue'
import RelatedTherapies from '../../components/RelatedTherapies.vue'
import { useSeoMeta } from '../../composables/useSeoMeta'
import { useFaqSchema } from '../../composables/useFaqSchema'

defineOptions({
  name: 'AdultosView',
})

useSeoMeta(() => ({
  title: 'Psicología para adultos en Dénia',
  description:
    'Terapia individual para adultos en Dénia y online: ansiedad, depresión, autoestima, duelo y momentos de transición vital, a tu ritmo.',
}))

const areas = [
  { label: 'Ansiedad', href: '/terapias/adultos/ansiedad' },
  { label: 'Depresión y estado de ánimo', href: '/terapias/adultos/depresion' },
  { label: 'Autoestima y desarrollo personal', href: '/terapias/adultos/autoestima' },
  { label: 'Duelo y pérdidas', href: '/terapias/adultos/duelo' },
]

const relatedLinks = [
  { label: 'Psicología infantil', href: '/terapias/infantil' },
  { label: 'Psicología para adolescentes', href: '/terapias/adolescentes' },
  { label: 'Psicología para padres y familia', href: '/terapias/padres-familia' },
]

const beneficios = [
  'Más herramientas para gestionar el malestar emocional',
  'Mayor autoconocimiento',
  'Mejora en las relaciones personales',
  'Un espacio propio, sin prisas ni juicios',
]

const faqs = [
  {
    question: '¿Cuánto dura cada sesión?',
    answer:
      'Las sesiones individuales duran 50-60 minutos, con la frecuencia que decidamos juntas según tu proceso.',
  },
  {
    question: '¿Puedo hacer terapia online?',
    answer: 'Sí, ofrecemos sesiones online para toda España, además de consulta presencial en Dénia.',
  },
  {
    question: '¿Cómo sé si necesito ayuda profesional?',
    answer:
      'Si sientes que algo te sobrepasa, se repiten patrones que no puedes cambiar por tu cuenta o el malestar afecta a tu día a día, ya es un buen momento para pedir ayuda.',
  },
]

useFaqSchema(() => faqs)
</script>

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

.kb-pill-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.kb-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  font-size: 14px;
  color: var(--color-ink);
  background: var(--color-rose-soft-wash);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base),
    border-color var(--dur-base) var(--ease-base), color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-pill:hover {
    background: var(--color-rose);
    border-color: var(--color-rose);
    color: var(--color-on-rose);
    transform: translateY(-1px);
  }
}

.kb-therapy__list {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  width: fit-content;
  max-width: 46ch;
  display: flex;
  flex-direction: column;
  align-items: stretch;
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

@media (hover: hover) and (pointer: fine) {
  .kb-therapy__cta:hover {
    background: var(--color-rose-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-cta-hover);
  }
}
</style>
