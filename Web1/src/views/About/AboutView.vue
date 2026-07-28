<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchAboutMePage } from '../../services/dataService'
import { processWordPressContent } from '../../utils/contentProcessor'
import { useInternalLinks } from '../../composables/useInternalLinks'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import type { WordPressPage } from '../../types/api'

defineOptions({
  name: 'AboutView',
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
    const response = await fetchAboutMePage()
    pageData.value = response
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching about me page:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="kb-about">
    <div class="kb-about__header">
      <h1 class="kb-about__title text-h1">Sobre mí</h1>
    </div>

    <div class="kb-about__inner">
      <LoadingSpinner v-if="loading" message="Cargando contenido..." />

      <div v-else-if="error" class="kb-about__error">
        <p>Error: {{ error }}</p>
        <p class="text-secondary">Verifica que la API esté accesible.</p>
      </div>

      <div v-else-if="pageData" class="kb-about__card">
        <div ref="contentEl" class="kb-prose" v-html="processedContent"></div>
      </div>

      <div v-else class="kb-about__error">
        <p>No se encontró la página "Sobre mí".</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kb-about {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-about__header {
  max-width: 760px;
  margin: 0 auto 40px;
  text-align: center;
}

.kb-about__title {
  margin: 0;
}

.kb-about__inner {
  max-width: 760px;
  margin: 0 auto;
}

.kb-about__card {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  padding: clamp(28px, 5vw, 48px);
}

.kb-about__error {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-left: 3px solid #d32f2f;
  border-radius: var(--radius-md);
  padding: 24px 28px;
  color: #b23c3c;
}

.kb-about__error .text-secondary {
  margin-top: 6px;
}
</style>
