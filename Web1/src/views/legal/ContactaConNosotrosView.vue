<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { processWordPressContent } from '../../utils/contentProcessor'
import { fetchContactoPage } from '../../services/dataService'
import type { WordPressPage } from '../../types/api'

defineOptions({
  name: 'ContactaConNosotrosView',
})

const pageData = ref<WordPressPage | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const processedContent = computed(() => {
  if (!pageData.value) return ''
  return processWordPressContent(pageData.value.content.rendered)
})

onMounted(async () => {
  try {
    const response = await fetchContactoPage()
    pageData.value = response
    console.log('Contacto Response:', response)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching contacto:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="legal-view">
    <h1>Contacta con Nosotros</h1>

    <div v-if="loading" class="loading">Cargando información de contacto...</div>

    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
    </div>

    <div v-else-if="pageData" class="content">
      <h2>{{ pageData.title.rendered }}</h2>
      <div v-html="processedContent"></div>
    </div>

    <div v-else class="no-data">
      <p>No se encontró la información de contacto</p>
    </div>
  </div>
</template>

<style scoped>
.legal-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  color: #666;
  font-style: italic;
}

.error {
  color: #d32f2f;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 4px;
}

.content {
  margin-top: 2rem;
  line-height: 1.8;
}

.content h2 {
  margin-bottom: 1.5rem;
}

.no-data {
  color: #666;
  font-style: italic;
}
</style>
