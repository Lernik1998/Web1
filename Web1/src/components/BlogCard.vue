<template>
  <article class="kb-blog-card">
    <router-link :to="`/blog/${post.slug}`" class="kb-blog-card__media">
      <img
        :src="imageUrl"
        :alt="imageAlt"
        :title="imageTitle"
        class="kb-blog-card__image"
        loading="lazy"
      />
    </router-link>

    <div class="kb-blog-card__body">
      <div class="kb-blog-card__meta text-secondary">
        <span v-if="categoryName" class="kb-blog-card__category">{{ categoryName }}</span>
        <time :datetime="post.date">{{ formattedDate }}</time>
      </div>

      <h2 class="kb-blog-card__title text-h3">
        <router-link :to="`/blog/${post.slug}`">{{ post.title.rendered }}</router-link>
      </h2>

      <p class="kb-blog-card__excerpt text-secondary">{{ excerpt }}</p>

      <router-link :to="`/blog/${post.slug}`" class="kb-blog-card__link text-cta">
        Leer más
      </router-link>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { extractTextFromHtml, extractFirstImageUrl } from '../utils/contentProcessor'
import { getMediaUrl, getMediaAlt, getMediaTitle } from '../utils/media'
import type { WordPressPost } from '../types/api'

const props = defineProps<{
  post: WordPressPost
}>()

const imageUrl = computed(
  () =>
    getMediaUrl(props.post._embedded?.['wp:featuredmedia']?.[0], 'medium_large') ||
    extractFirstImageUrl(props.post.content.rendered) ||
    '/images/psicologa-denia-hero.jpg',
)

const imageAlt = computed(() =>
  getMediaAlt(props.post._embedded?.['wp:featuredmedia']?.[0], props.post.title.rendered),
)

const imageTitle = computed(() =>
  getMediaTitle(props.post._embedded?.['wp:featuredmedia']?.[0], props.post.title.rendered),
)

const categoryName = computed(() => props.post._embedded?.['wp:term']?.[0]?.[0]?.name ?? null)

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(props.post.date),
  ),
)

const excerpt = computed(() => extractTextFromHtml(props.post.excerpt.rendered, 180))
</script>

<style scoped>
.kb-blog-card {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--dur-base) var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-blog-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-popover);
    border-color: transparent;
  }
}

.kb-blog-card.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-blog-card.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (hover: hover) and (pointer: fine) {
  .kb-blog-card.kb-animate-onscroll.is-visible:hover {
    transform: translateY(-3px);
    transition: transform var(--dur-base) var(--ease-base),
      box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
  }
}

.kb-blog-card__media {
  display: block;
  overflow: hidden;
}

.kb-blog-card__image {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: center 20%;
  transform: scale(1);
  transition: transform var(--dur-slow) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-blog-card:hover .kb-blog-card__image {
    transform: scale(1.05);
  }
}

.kb-blog-card__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px 28px 24px 0;
}

.kb-blog-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.kb-blog-card__category {
  color: var(--color-rose-hover);
  font-weight: 500;
}

.kb-blog-card__category::after {
  content: '·';
  margin-left: 10px;
  color: var(--color-secondary);
}

.kb-blog-card__title {
  margin-bottom: 10px;
}

.kb-blog-card__title a {
  color: var(--color-heading);
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-blog-card__title a:hover {
    color: var(--color-rose-hover);
  }
}

.kb-blog-card__excerpt {
  color: var(--color-ink);
  line-height: 1.6;
  margin-bottom: 18px;
}

.kb-blog-card__link {
  display: inline-flex;
  align-items: center;
  color: var(--color-rose-hover);
  text-decoration: none;
  border-bottom: 1px solid var(--color-rose);
  padding-bottom: 2px;
  transition: color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-blog-card__link:hover {
    color: var(--color-rose);
  }
}

/* ---------- Responsive ---------- */
@media (max-width: 640px) {
  .kb-blog-card {
    grid-template-columns: 1fr;
  }

  .kb-blog-card__body {
    padding: 20px;
  }

  /* En pantallas estrechas "SIN CATEGORÍA" + la fecha no caben en una sola
     línea; dejarlos en fila hacía que el "·" separador quedase suelto en
     una línea propia. Apilados se lee limpio y el separador sobra. */
  .kb-blog-card__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .kb-blog-card__category::after {
    content: '';
    margin-left: 0;
  }
}
</style>
