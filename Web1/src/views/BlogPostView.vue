<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { fetchBlogPostBySlug } from '../services/dataService'
import { processWordPressContent } from '../utils/contentProcessor'
import { useInternalLinks } from '../composables/useInternalLinks'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import type { WordPressPost } from '../types/api'

defineOptions({
  name: 'BlogPostView',
})

const props = defineProps<{
  slug: string
}>()

const post = ref<WordPressPost | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const contentEl = ref<HTMLElement | null>(null)

useInternalLinks(contentEl)

const imageUrl = computed(
  () => post.value?._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/psicologa-denia-hero.jpg',
)

const imageAlt = computed(
  () => post.value?._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.value?.title.rendered || '',
)

const categoryName = computed(() => post.value?._embedded?.['wp:term']?.[0]?.[0]?.name ?? null)

const formattedDate = computed(() => {
  if (!post.value) return ''
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(post.value.date),
  )
})

const processedContent = computed(() => {
  if (!post.value) return ''
  return processWordPressContent(post.value.content.rendered)
})

async function loadPost(slug: string) {
  loading.value = true
  error.value = null
  try {
    post.value = await fetchBlogPostBySlug(slug)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching blog post:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPost(props.slug))
watch(() => props.slug, (slug) => loadPost(slug))
</script>

<template>
  <section class="kb-post">
    <div class="kb-post__inner">
      <router-link to="/blog" class="kb-post__back text-secondary">← Volver al blog</router-link>

      <LoadingSpinner v-if="loading" message="Cargando artículo..." />

      <div v-else-if="error" class="kb-post__error">
        <p>Error: {{ error }}</p>
        <p class="text-secondary">Verifica que la API esté accesible.</p>
      </div>

      <article v-else-if="post" class="kb-post__article">
        <div class="kb-post__meta text-secondary">
          <span v-if="categoryName" class="kb-post__category">{{ categoryName }}</span>
          <time :datetime="post.date">{{ formattedDate }}</time>
        </div>

        <h1 class="kb-post__title text-h1">{{ post.title.rendered }}</h1>

        <img :src="imageUrl" :alt="imageAlt" class="kb-post__image" />

        <div ref="contentEl" class="kb-prose" v-html="processedContent"></div>
      </article>

      <div v-else class="kb-post__error">
        <p>No se encontró el artículo.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kb-post {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-post__inner {
  max-width: 760px;
  margin: 0 auto;
}

.kb-post__back {
  display: inline-block;
  margin-bottom: 28px;
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-base);
}

.kb-post__back:hover {
  color: var(--color-rose-hover);
}

.kb-post__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

.kb-post__category {
  color: var(--color-rose-hover);
  font-weight: 500;
}

.kb-post__category::after {
  content: '·';
  margin-left: 10px;
  color: var(--color-secondary);
}

.kb-post__title {
  margin-bottom: 24px;
}

.kb-post__image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  margin-bottom: 32px;
}

.kb-post__error {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-left: 3px solid #d32f2f;
  border-radius: var(--radius-md);
  padding: 24px 28px;
  color: #b23c3c;
}
</style>
