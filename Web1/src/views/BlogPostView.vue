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
        <img :src="imageUrl" :alt="imageAlt" class="kb-post__image" />

        <div class="kb-post__body">
          <div class="kb-post__meta text-secondary">
            <span v-if="categoryName" class="kb-post__category">{{ categoryName }}</span>
            <time :datetime="post.date">{{ formattedDate }}</time>
          </div>

          <h1 class="kb-post__title text-h1">{{ post.title.rendered }}</h1>

          <div ref="contentEl" class="kb-prose" v-html="processedContent"></div>
        </div>
      </article>

      <div v-else class="kb-post__error">
        <p>No se encontró el artículo.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { fetchBlogPostBySlug } from '../services/dataService'
import {
  processWordPressContent,
  extractFirstImageUrl,
  extractTextFromHtml,
  reflowSoftLineBreaks,
} from '../utils/contentProcessor'
import { useInternalLinks } from '../composables/useInternalLinks'
import { useSeoMeta, truncateForMeta } from '../composables/useSeoMeta'
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

const featuredMediaUrl = computed(
  () => post.value?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
)

// Si el artículo no tiene imagen destacada en WordPress, usamos la primera
// imagen que traiga el propio contenido en vez del marcador de posición
// genérico (para no mostrar, por ejemplo, la foto de María en todos los
// artículos que no tengan destacada).
const contentFallbackImageUrl = computed(() =>
  post.value ? extractFirstImageUrl(post.value.content.rendered) : null,
)

const usingContentFallback = computed(
  () => !featuredMediaUrl.value && !!contentFallbackImageUrl.value,
)

const imageUrl = computed(
  () => featuredMediaUrl.value || contentFallbackImageUrl.value || '/images/psicologa-denia-hero.jpg',
)

const imageAlt = computed(
  () => post.value?._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.value?.title.rendered || '',
)

const categoryName = computed(() => post.value?._embedded?.['wp:term']?.[0]?.[0]?.name ?? null)

useSeoMeta(
  computed(() => {
    if (!post.value) return null
    const rawExcerpt = post.value.excerpt.rendered || post.value.content.rendered
    return {
      title: extractTextFromHtml(post.value.title.rendered, 70),
      description: truncateForMeta(extractTextFromHtml(rawExcerpt, 400)),
      // Mismos dos primeros niveles de respaldo que la imagen visible de la
      // página (ver `imageUrl` más arriba): si no hay destacada pero sí una
      // imagen real en el contenido, esa debe ser la miniatura al compartir
      // el enlace, no el logo genérico. Se omite el tercer nivel (la foto
      // fija de respaldo) porque es una ruta relativa, no una URL absoluta
      // como exige Open Graph -- si no hay ninguna imagen real, se deja sin
      // definir y useSeoMeta usa su propio valor por defecto (ya absoluto).
      image: featuredMediaUrl.value ?? contentFallbackImageUrl.value ?? undefined,
      type: 'article',
    }
  }),
)

const formattedDate = computed(() => {
  if (!post.value) return ''
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(post.value.date),
  )
})

const processedContent = computed(() => {
  if (!post.value) return ''
  let html = post.value.content.rendered

  // Si esa primera imagen se está usando como cabecera, la quitamos del
  // cuerpo para que no salga duplicada.
  if (usingContentFallback.value) {
    const withoutFigure = html.replace(/<figure[^>]*>[\s\S]*?<\/figure>/, '')
    html = withoutFigure !== html ? withoutFigure : html.replace(/<img[^>]+>/, '')
  }

  return reflowSoftLineBreaks(processWordPressContent(html))
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

<style scoped>
.kb-post {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-post__inner {
  max-width: 800px;
  margin: 0 auto;
}

.kb-post__back {
  display: inline-flex;
  align-items: center;
  margin-bottom: 20px;
  color: var(--color-secondary);
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-post__back:hover {
    color: var(--color-rose-hover);
  }
}

/* Tarjeta de lectura: separa el artículo del fondo de la página para que la
   vista se sienta como un espacio de lectura tranquilo y contenido, en vez
   de texto flotando directamente sobre el fondo. */
.kb-post__article {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-popover);
}

.kb-post__image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.kb-post__body {
  padding: clamp(28px, 5vw, 48px) clamp(24px, 6vw, 64px) clamp(40px, 6vw, 64px);
}

.kb-post__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 13px;
  margin-bottom: 16px;
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
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-line);
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
