<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchHomePage, fetchMediaById } from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Hero from '../components/Hero.vue'
import TherapyCards from '../components/TherapyCards.vue'
import type { WordPressHomePage } from '../types/api'

defineOptions({
  name: 'InicioView',
})

const therapyHrefs = [
  '/terapia-online/infantil',
  '/terapia-online/adolescentes',
  '/terapia-online/adultos',
  '/terapia-online/padres-familia',
]

const pageData = ref<WordPressHomePage | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const mediaUrls = ref<Record<number, string>>({})

const heroProps = computed(() => {
  const acf = pageData.value?.acf
  if (!acf) return null
  return {
    title: acf.hero_title,
    description: acf.hero_description,
    buttonText: acf.hero_button_text,
    imageUrl: mediaUrls.value[acf.hero_image] ?? '',
  }
})

const therapyCards = computed(() => {
  const acf = pageData.value?.acf
  if (!acf) return []

  const titles = [acf.therapy_1_title, acf.therapy_2_title_, acf.therapy_3_title, acf.therapy_4_title]
  const descriptions = [
    acf.therapy_1_description,
    acf.therapy_2_description,
    acf.therapy_3_description,
    acf.therapy_4_description,
  ]
  const buttonTexts = [
    acf.therapy_1_button_text,
    acf.therapy_2_button_text,
    acf.therapy_3_button_text,
    acf.therapy_4_button_text,
  ]
  const images = [acf.therapy_1_image, acf.therapy_2_image, acf.therapy_3_image, acf.therapy_4_image]

  return titles.map((title, index) => ({
    title,
    description: descriptions[index] ?? '',
    buttonText: buttonTexts[index] ?? 'Me interesa',
    imageUrl: mediaUrls.value[images[index] ?? 0] ?? '',
    href: therapyHrefs[index] ?? '/',
  }))
})

onMounted(async () => {
  try {
    const response = await fetchHomePage()
    pageData.value = response

    const acf = response?.acf
    if (acf) {
      const mediaIds = [...new Set([
        acf.hero_image,
        acf.therapy_1_image,
        acf.therapy_2_image,
        acf.therapy_3_image,
        acf.therapy_4_image,
      ])].filter(Boolean)

      const mediaResults = await Promise.all(mediaIds.map((id) => fetchMediaById(id)))
      const urlMap: Record<number, string> = {}
      mediaResults.forEach((media, index) => {
        const id = mediaIds[index]
        if (id && media?.source_url) urlMap[id] = media.source_url
      })
      mediaUrls.value = urlMap
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching WordPress page:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <LoadingSpinner v-if="loading" message="Cargando..." />

    <div v-else-if="error" class="state-box error">
      <p>Error: {{ error }}</p>
      <p>Verifica que la API https://kanbouripsicologia.com esté accesible</p>
    </div>

    <template v-else-if="heroProps">
      <Hero v-bind="heroProps" />
      <TherapyCards :cards="therapyCards" />
    </template>

    <div v-else class="state-box no-data">
      <p>No se encontró la página con slug 'home'</p>
    </div>
  </div>
</template>

<style scoped>
.state-box {
  max-width: 640px;
  margin: 3rem auto;
  padding: 1.5rem;
  text-align: center;
  border-radius: var(--radius-md);
}

.error {
  color: #b23c3c;
  background-color: #ffebee;
}

.no-data {
  color: #666;
  font-style: italic;
}
</style>
