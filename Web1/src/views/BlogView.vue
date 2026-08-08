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
      <div v-if="loading" class="kb-blog__list" aria-hidden="true">
        <div v-for="n in 3" :key="n" class="kb-skeleton-card">
          <div class="kb-skeleton kb-skeleton-card__media"></div>
          <div class="kb-skeleton-card__body">
            <div class="kb-skeleton" style="width: 90px; height: 12px"></div>
            <div class="kb-skeleton" style="width: 70%; height: 22px; margin-top: 12px"></div>
            <div class="kb-skeleton" style="width: 100%; height: 14px; margin-top: 16px"></div>
            <div class="kb-skeleton" style="width: 85%; height: 14px; margin-top: 8px"></div>
            <div
              class="kb-skeleton"
              style="width: 120px; height: 32px; margin-top: 18px; border-radius: 999px"
            ></div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="kb-blog__error">
        <p>Error: {{ error }}</p>
        <p class="text-secondary">Verifica que la API esté accesible.</p>
      </div>

      <div v-else-if="posts.length === 0" class="kb-blog__empty">
        <p>Todavía no hay artículos publicados. ¡Vuelve pronto!</p>
      </div>

      <template v-else>
        <div class="kb-blog__list">
          <BlogCard
            v-for="(post, i) in posts"
            :key="post.id"
            :post="post"
            v-animate-on-scroll
            v-spotlight
            :style="{ transitionDelay: `${Math.min(i, 4) * 100}ms` }"
          />
        </div>

        <nav v-if="totalPages > 1" class="kb-blog__pagination" aria-label="Paginación del blog">
          <button
            type="button"
            class="kb-blog__page-btn"
            :disabled="page <= 1"
            @click="goToPage(page - 1)"
          >
            ← Anteriores
          </button>
          <span class="kb-blog__page-status text-secondary">Página {{ page }} de {{ totalPages }}</span>
          <button
            type="button"
            class="kb-blog__page-btn"
            :disabled="page >= totalPages"
            @click="goToPage(page + 1)"
          >
            Siguientes →
          </button>
        </nav>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchBlogPosts } from '../services/dataService'
import { useSeoMeta } from '../composables/useSeoMeta'
import BlogCard from '../components/BlogCard.vue'
import type { WordPressPost } from '../types/api'

defineOptions({
  name: 'BlogView',
})

useSeoMeta(() => ({
  title: 'Blog de psicología en Dénia',
  description:
    'Artículos sobre bienestar emocional, ansiedad, autoestima y terapia, escritos por el equipo de Kanbouri Psicología en Dénia.',
}))

const posts = ref<WordPressPost[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const page = ref(1)
const totalPages = ref(1)

async function loadPage(targetPage: number) {
  loading.value = true
  error.value = null
  try {
    const result = await fetchBlogPosts(targetPage)
    posts.value = result.posts
    totalPages.value = result.totalPages
    page.value = targetPage
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching blog posts:', err)
  } finally {
    loading.value = false
  }
}

function goToPage(targetPage: number) {
  if (targetPage < 1 || targetPage > totalPages.value || targetPage === page.value) return
  loadPage(targetPage)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => loadPage(1))
</script>

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

.kb-blog__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(16px, 3vw, 28px);
  margin-top: clamp(40px, 6vw, 56px);
  /* El botón flotante de WhatsApp/Cookies (WhatsAppButton.vue,
     CookieConsent.vue) usa z-index 140-150 y puede coincidir en pantalla
     con esta franja al hacer scroll en móvil. Con `position: relative` y un
     z-index mayor, la paginación queda siempre por encima y pulsable, sin
     tener que sacrificar el layout centrado. */
  position: relative;
  z-index: 160;
}

.kb-blog__page-btn {
  padding: 10px 22px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  cursor: pointer;
  transition: border-color var(--dur-base) var(--ease-base),
    color var(--dur-base) var(--ease-base), transform var(--dur-base) var(--ease-base);
}

.kb-blog__page-btn:hover:not(:disabled) {
  border-color: var(--color-rose);
  color: var(--color-rose-hover);
  transform: translateY(-1px);
}

.kb-blog__page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.kb-blog__page-status {
  min-width: 110px;
  text-align: center;
}

@media (max-width: 640px) {
  .kb-blog__pagination {
    gap: 12px;
  }

  .kb-blog__page-status {
    min-width: auto;
  }
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

/* ---------- Skeleton (mientras cargan los artículos) ---------- */
.kb-skeleton-card {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.kb-skeleton-card__media {
  aspect-ratio: 4 / 3;
}

.kb-skeleton-card__body {
  padding: 24px 28px 24px 0;
}

.kb-skeleton {
  background: linear-gradient(
    90deg,
    var(--color-line) 25%,
    rgba(255, 255, 255, 0.7) 50%,
    var(--color-line) 75%
  );
  background-size: 200% 100%;
  animation: kb-skeleton-shimmer 1.4s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@keyframes kb-skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 640px) {
  .kb-skeleton-card {
    grid-template-columns: 1fr;
  }

  .kb-skeleton-card__body {
    padding: 20px;
  }
}
</style>
