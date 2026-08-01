<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchPsychologyParentsPage } from '../../services/dataService'
import { parseTherapyContent } from '../../utils/therapyParser'
import type { ParsedTherapyContent } from '../../utils/therapyParser'
import FaqAccordion from '../../components/FaqAccordion.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

defineOptions({
  name: 'PadresFamiliaView',
})

const loading = ref(true)
const content = ref<ParsedTherapyContent | null>(null)
const title = ref('Psicología para padres y familia')

onMounted(async () => {
  try {
    const page = await fetchPsychologyParentsPage()
    if (page) {
      title.value = page.title.rendered
      content.value = parseTherapyContent(page.content.rendered)
    }
  } catch (err) {
    console.error('Error fetching psychology parents page:', err)
  } finally {
    loading.value = false
  }
})

const faqs = [
  {
    question: '¿Vienen todos los miembros de la familia a la vez?',
    answer:
      'Depende del caso: a veces trabajamos solo con los padres, otras con toda la familia junta, según lo que sea más útil.',
  },
  {
    question: '¿Esto es terapia de pareja?',
    answer:
      'No necesariamente; nos centramos en la dinámica familiar y la crianza, aunque puede complementarse con terapia de pareja si hace falta.',
  },
  {
    question: '¿Cuánto dura el acompañamiento?',
    answer:
      'Muchas familias notan mejoras con un número limitado de sesiones centradas en pautas concretas; otras prefieren un acompañamiento más largo.',
  },
]
</script>

<template>
  <section class="kb-therapy">
    <LoadingSpinner v-if="loading" message="Cargando..." />

    <template v-else>
      <div class="kb-therapy__header">
        <h1 class="kb-therapy__title text-h1">{{ title }}</h1>
        <p v-if="content?.intro" class="kb-therapy__lead text-body">{{ content.intro }}</p>
      </div>

      <div class="kb-therapy__card">
        <div
          v-for="block in content?.blocks"
          :key="block.title"
          class="kb-therapy__block"
          v-animate-on-scroll
        >
          <h2 class="text-h2">{{ block.title }}</h2>
          <ul v-if="block.type === 'list'" class="kb-therapy__list">
            <li v-for="item in block.items" :key="item">{{ item }}</li>
          </ul>
          <p v-else class="text-body">{{ block.text }}</p>
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
          :to="{ path: '/pedir-cita', query: { servicio: 'padres-familia' } }"
          class="kb-therapy__cta text-cta"
        >
          Pedir cita
        </router-link>
      </div>
    </template>
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
