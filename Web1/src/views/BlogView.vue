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
          <!-- Enlaces reales (<a href>), no botones con @click: así un
               rastreador que no ejecute JavaScript (o que no simule clics)
               puede seguir la ruta hasta las páginas siguientes y descubrir
               el resto de artículos, no solo los de la primera página. -->
          <router-link
            v-if="pageNumber > 1"
            :to="pagePath(pageNumber - 1)"
            class="kb-blog__page-btn"
          >
            ← Anteriores
          </router-link>
          <span v-else class="kb-blog__page-btn" aria-disabled="true">← Anteriores</span>

          <span class="kb-blog__page-status text-secondary">Página {{ pageNumber }} de {{ totalPages }}</span>

          <router-link
            v-if="pageNumber < totalPages"
            :to="pagePath(pageNumber + 1)"
            class="kb-blog__page-btn"
          >
            Siguientes →
          </router-link>
          <span v-else class="kb-blog__page-btn" aria-disabled="true">Siguientes →</span>
        </nav>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { fetchBlogPosts } from '../services/dataService'
import { useSeoMeta } from '../composables/useSeoMeta'
import { getEmbeddedHydration, recordHydration } from '../utils/hydration'
import BlogCard from '../components/BlogCard.vue'
import type { WordPressPost } from '../types/api'

defineOptions({
  name: 'BlogView',
})

// Llega como string desde la ruta "/blog/pagina/:page(\\d+)" (o undefined en
// "/blog", que es la página 1). Ver src/router/index.ts.
const props = defineProps<{ page?: string }>()

const pageNumber = computed(() => {
  const parsed = Number(props.page)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
})

// La página 1 sigue siendo "/blog" a secas (no "/blog/pagina/1"): es la URL
// que ya está en el sitemap, en llms.txt y enlazada desde el resto del
// sitio, así que no tiene sentido introducir una segunda URL equivalente.
function pagePath(n: number): string {
  return n <= 1 ? '/blog' : `/blog/pagina/${n}`
}

useSeoMeta(() => ({
  title:
    pageNumber.value > 1
      ? `Blog de psicología en Dénia (página ${pageNumber.value})`
      : 'Blog de psicología en Dénia',
  description:
    'Artículos sobre bienestar emocional, ansiedad, autoestima y terapia, escritos por el equipo de Kanbouri Psicología en Dénia.',
}))

const posts = ref<WordPressPost[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const totalPages = ref(1)

// No usa useHydratedAsync (composables/useHydratedAsync.ts): esta vista
// puede volver a pedir datos DESPUÉS del montaje inicial (al paginar de
// "/blog" a "/blog/pagina/2" sin recargar la página, ver el `watch` de más
// abajo), algo que ese composable no contempla (solo hidrata la primera
// carga). Aun así sigue el mismo mecanismo a mano: si el HTML ya trae
// incrustados los posts de esta página exacta (pre-renderizado de esta
// misma ruta), se usan directamente y de forma síncrona -- sin ellos, se
// piden a la API como siempre.
async function loadPage(targetPage: number) {
  const key = `blog:page:${targetPage}`
  const embedded = getEmbeddedHydration()?.[key] as
    | { posts: WordPressPost[]; totalPages: number }
    | undefined

  if (embedded !== undefined) {
    posts.value = embedded.posts
    totalPages.value = embedded.totalPages
    loading.value = false
    recordHydration(key, embedded)
    return
  }

  loading.value = true
  error.value = null
  try {
    const result = await fetchBlogPosts(targetPage)
    posts.value = result.posts
    totalPages.value = result.totalPages
    recordHydration(key, { posts: result.posts, totalPages: result.totalPages })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching blog posts:', err)
  } finally {
    loading.value = false
  }
}

// La paginación ahora navega a una ruta distinta ("/blog" <-> "/blog/pagina/N"),
// no cambia un estado interno: hace falta un watcher (no basta onMounted) para
// que ir de "/blog/pagina/2" a "/blog/pagina/3" recargue los datos, ya que
// vue-router reutiliza la misma instancia del componente entre ellas. El
// scroll al principio de la página ya lo gestiona el `scrollBehavior` del
// router (ver src/router/index.ts), no hace falta repetirlo aquí.
watch(pageNumber, (n) => loadPage(n), { immediate: true })
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
  text-decoration: none;
  cursor: pointer;
  transition: border-color var(--dur-base) var(--ease-base),
    color var(--dur-base) var(--ease-base), transform var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-blog__page-btn:hover:not([aria-disabled='true']) {
    border-color: var(--color-rose);
    color: var(--color-rose-hover);
    transform: translateY(-1px);
  }
}

/* Los extremos de la paginación (antes del disabled en <button>, ahora un
   <span> en vez de un <router-link>: ver la plantilla) ya no son un enlace,
   solo texto -- el estado visual "apagado" es el mismo de siempre. */
.kb-blog__page-btn[aria-disabled='true'] {
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
