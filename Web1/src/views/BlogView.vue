<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchBlogPosts } from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import BlogCard from '../components/BlogCard.vue'
import type { WordPressPost } from '../types/api'

defineOptions({
  name: 'BlogView',
})

const posts = ref<WordPressPost[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    posts.value = await fetchBlogPosts()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching blog posts:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="kb-blog">
    <div class="kb-blog__header">
      <h1 class="kb-blog__title text-h1">Recursos y reflexiones</h1>
      <p class="kb-blog__lead text-body">
        Artículos sobre bienestar emocional, terapia y psicología, escritos
        para acompañarte también fuera de la consulta.
      </p>
    </div>

    <div class="kb-blog__inner">
      <LoadingSpinner v-if="loading" message="Cargando artículos..." />

      <div v-else-if="error" class="kb-blog__error">
        <p>Error: {{ error }}</p>
        <p class="text-secondary">Verifica que la API esté accesible.</p>
      </div>

      <div v-else-if="posts.length === 0" class="kb-blog__empty">
        <p>Todavía no hay artículos publicados. ¡Vuelve pronto!</p>
      </div>

      <div v-else class="kb-blog__list">
        <BlogCard
          v-for="(post, i) in posts"
          :key="post.id"
          :post="post"
          v-animate-on-scroll
          :style="{ transitionDelay: `${Math.min(i, 4) * 100}ms` }"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.kb-blog {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-blog__header {
  max-width: 640px;
  margin: 0 auto 48px;
  text-align: center;
}

.kb-blog__title {
  margin-bottom: 14px;
}

.kb-blog__lead {
  color: var(--color-ink);
}

.kb-blog__inner {
  max-width: 880px;
  margin: 0 auto;
}

.kb-blog__list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.kb-blog__error,
.kb-blog__empty {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: clamp(28px, 5vw, 40px);
  text-align: center;
}

.kb-blog__error {
  border-left: 3px solid #d32f2f;
  color: #b23c3c;
}
</style>
