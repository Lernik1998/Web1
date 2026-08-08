<template>
  <section class="kb-legal">
    <div class="kb-legal__header">
      <p class="kb-legal__eyebrow text-secondary">Legal</p>
      <h1 class="kb-legal__title text-h1">Política de Privacidad</h1>
    </div>

    <div class="kb-legal__inner">
      <LoadingSpinner v-if="loading" message="Cargando política de privacidad..." />

      <div v-else-if="error" class="kb-legal__error">
        <p>Error: {{ error }}</p>
        <p class="text-secondary">Verifica que la API esté accesible.</p>
      </div>

      <div v-else-if="pageData" class="kb-legal__card">
        <div ref="contentEl" class="kb-prose" v-html="processedContent"></div>
      </div>

      <div v-else class="kb-legal__error">
        <p>No se encontró la política de privacidad.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { processWordPressContent } from '../../utils/contentProcessor'
import { useInternalLinks } from '../../composables/useInternalLinks'
import { fetchPoliticaPrivacidadPage } from '../../services/dataService'
import { useSeoMeta } from '../../composables/useSeoMeta'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import type { WordPressPage } from '../../types/api'

defineOptions({
  name: 'PoliticaPrivacidadView',
})

useSeoMeta(() => ({
  title: 'Política de privacidad',
  description: 'Política de privacidad de Kanbouri Psicología, centro de psicología en Dénia.',
}))

const pageData = ref<WordPressPage | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const contentEl = ref<HTMLElement | null>(null)

useInternalLinks(contentEl)

const processedContent = computed(() => {
  if (!pageData.value) return ''
  return processWordPressContent(pageData.value.content.rendered)
})

onMounted(async () => {
  try {
    const response = await fetchPoliticaPrivacidadPage()
    pageData.value = response
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching política de privacidad:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.kb-legal {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-legal__header {
  max-width: 760px;
  margin: 0 auto 40px;
  text-align: center;
}

.kb-legal__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-rose-hover);
  margin-bottom: 12px;
}

.kb-legal__title {
  margin: 0;
}

.kb-legal__inner {
  max-width: 760px;
  margin: 0 auto;
}

.kb-legal__card {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  padding: clamp(28px, 5vw, 48px);
}

.kb-legal__error {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-left: 3px solid #d32f2f;
  border-radius: var(--radius-md);
  padding: 24px 28px;
  color: #b23c3c;
}

.kb-legal__error .text-secondary {
  margin-top: 6px;
}
</style>
