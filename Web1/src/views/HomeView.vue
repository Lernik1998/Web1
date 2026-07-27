<template>
  <div class="inicio-view">
    <LoadingSpinner v-if="loading" message="Cargando..." />

    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
      <p>Verifica que la API https://kanbouripsicologia.com esté accesible</p>
    </div>

    <div v-else-if="pageData" class="data">
      <h3>{{ pageData.title.rendered }}</h3>
      <div ref="contentEl" class="content">
        <AppHero  />
      </div>
      <details class="debug">
        <summary>Ver datos crudos de WordPress</summary>
        <pre>{{ JSON.stringify(pageData, null, 2) }}</pre>
      </details>
    </div>

    <div v-else class="no-data">
      <p>No se encontró la página con slug 'home'</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchHomePage } from '../services/dataService'
import { processWordPressContent } from '../utils/contentProcessor'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import type { WordPressPage } from '../types/api'
import { useInternalLinks } from '../composables/useInternalLinks'

// Componentes
import AppHero from '../components/AppHero.vue'

defineOptions({
  name: 'InicioView',
})
const contentEl = ref<HTMLElement | null>(null)
useInternalLinks(contentEl)

const pageData = ref<WordPressPage | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const processedContent = computed(() => {
  if (!pageData.value) return ''
  return processWordPressContent(pageData.value.content.rendered)
})

onMounted(async () => {
  try {
    // Fetch WordPress page by slug
    const response = await fetchHomePage()
    pageData.value = response
    console.log('WordPress Page Response:', response)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching WordPress page:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.inicio-view {
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

.data {
  margin-top: 1rem;
}

.data pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.content {
  margin-top: 1rem;
  line-height: 1.6;
}

.debug {
  margin-top: 2rem;
}

.debug summary {
  cursor: pointer;
  color: #666;
  font-weight: 500;
}

.no-data {
  color: #666;
  font-style: italic;
}
</style>
