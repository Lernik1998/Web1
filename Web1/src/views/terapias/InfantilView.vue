<template>
  <section class="kb-therapy">
    <LoadingSpinner v-if="loading" message="Cargando..." />

    <div v-else-if="error" class="kb-therapy__error">
      <p class="text-body">
        No se ha podido cargar el contenido de esta página. Por favor,
        inténtalo de nuevo en unos minutos.
      </p>
      <router-link to="/pedir-cita" class="kb-therapy__cta kb-glare text-cta">
        Pedir cita
      </router-link>
    </div>

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

        <div v-if="content?.faqs.length" class="kb-therapy__block" v-animate-on-scroll>
          <h2 class="text-h2">{{ content.faqLabel }}</h2>
          <div class="kb-therapy__faq">
            <FaqAccordion :items="content.faqs" />
          </div>
        </div>

        <div class="kb-therapy__block">
          <RelatedTherapies :links="relatedLinks" />
        </div>
      </div>

      <div class="kb-therapy__final">
        <router-link
          :to="{ path: '/pedir-cita', query: { servicio: 'infantil' } }"
          class="kb-therapy__cta kb-glare text-cta"
        >
          Pedir cita
        </router-link>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchTherapieBySlug } from '../../services/dataService'
import { parseTherapieAcf } from '../../utils/therapyAcf'
import type { ParsedTherapyContent } from '../../utils/therapyAcf'
import { useSeoMeta, truncateForMeta } from '../../composables/useSeoMeta'
import { useFaqSchema } from '../../composables/useFaqSchema'
import FaqAccordion from '../../components/FaqAccordion.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import RelatedTherapies from '../../components/RelatedTherapies.vue'

defineOptions({
  name: 'InfantilView',
})

const loading = ref(true)
const error = ref<string | null>(null)
const content = ref<ParsedTherapyContent | null>(null)
const title = ref('Psicología infantil')

onMounted(async () => {
  try {
    const therapy = await fetchTherapieBySlug('psicologia-infantil')
    if (therapy) {
      title.value = therapy.title.rendered
      content.value = parseTherapieAcf(therapy.acf)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching child psychology therapy:', err)
  } finally {
    loading.value = false
  }
})

useSeoMeta(
  computed(() =>
    content.value
      ? { title: `${title.value} en Dénia`, description: truncateForMeta(content.value.intro) }
      : null,
  ),
)

const relatedLinks = [
  { label: 'Psicología para adolescentes', href: '/terapias/adolescentes' },
  { label: 'Psicología para padres y familia', href: '/terapias/padres-familia' },
  { label: 'Psicología para adultos', href: '/terapias/adultos' },
]

useFaqSchema(() => content.value?.faqs)
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

.kb-therapy__error {
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
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
