<template>
  <section id="padres-familia" class="kb-page">
    <LoadingSpinner v-if="loading" message="Cargando contenido..." />

    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
    </div>

    <div v-else-if="pageData" class="kb-page__content">
      <div ref="contentEl" v-html="processedContent"></div>
    </div>

    <div v-else class="no-data">
      <p>No se encontró la página 'padres'</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchPadresPage } from '../../services/dataService'
import { processWordPressContent } from '../../utils/contentProcessor'
import { useInternalLinks } from '../../composables/useInternalLinks'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import type { WordPressPage } from '../../types/api'

defineOptions({
  name: 'PadresFamiliaView',
})

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
    const response = await fetchPadresPage()
    pageData.value = response
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching padres y familia:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.kb-page {
  background: var(--color-paper);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.error {
  color: #d32f2f;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 4px;
}

.kb-page__content {
  line-height: 1.6;
}

.no-data {
  color: #666;
  font-style: italic;
}
</style>
