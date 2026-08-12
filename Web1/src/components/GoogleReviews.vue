<template>
  <section v-if="loading || visibleReviews.length" class="kb-reviews">
    <div class="kb-reviews__inner">
      <div class="kb-reviews__intro" v-animate-on-scroll>
        <span class="kb-reviews__badge">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 13.9a6.6 6.6 0 010-4.2V6.85H2.18a11 11 0 000 9.9l3.66-2.85z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 5.85l3.66 2.85c.87-2.6 3.3-4.32 6.16-4.32z"
            />
          </svg>
          Reseñas reales verificadas en Google
        </span>
        <h2 class="kb-reviews__title text-h2">{{ title }}</h2>
      </div>

      <div v-if="loading" class="kb-reviews__grid">
        <div v-for="n in 3" :key="n" class="kb-reviews__skeleton" aria-hidden="true"></div>
      </div>

      <transition v-else name="kb-reviews-fade" mode="out-in">
      <div :key="page" class="kb-reviews__grid">
        <article
          v-for="(review, index) in pagedReviews"
          :key="review.id"
          class="kb-review"
          v-animate-on-scroll
          :style="{ transitionDelay: `${index * 90}ms` }"
        >
          <div class="kb-review__header">
            <span class="kb-review__avatar-wrap">
              <img
                v-if="!brokenPhotos.has(review.id)"
                :src="avatarSrc(review.user_photo)"
                :alt="review.user"
                class="kb-review__avatar-img"
                loading="lazy"
                referrerpolicy="no-referrer"
                @error="onPhotoError(review.id)"
              />
              <span v-else class="kb-review__avatar-fallback" aria-hidden="true">
                {{ initials(review.user) }}
              </span>

              <span class="kb-review__google-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 13.9a6.6 6.6 0 010-4.2V6.85H2.18a11 11 0 000 9.9l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 5.85l3.66 2.85c.87-2.6 3.3-4.32 6.16-4.32z"
                  />
                </svg>
              </span>
            </span>

            <span class="kb-review__meta">
              <span class="kb-review__name">{{ review.user }}</span>
              <span v-if="formattedDate(review.date)" class="kb-review__date">
                {{ formattedDate(review.date) }}
              </span>
            </span>
          </div>

          <div class="kb-review__stars">
            <span class="kb-visually-hidden">
              Valoración: {{ starCount(review.rating) }} de 5 estrellas.
            </span>
            <svg
              v-for="n in starCount(review.rating)"
              :key="n"
              viewBox="0 0 20 20"
              width="15"
              height="15"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.79L10 14.77l-5.21 2.74 1-5.79-4.21-4.1 5.82-.85z"
              />
            </svg>
            <span class="kb-review__verified" title="Reseña verificada por Google">
              <svg viewBox="0 0 20 20" width="13" height="13">
                <path
                  fill="currentColor"
                  d="M10 1.7l1.98 1.06 2.24-.36 1.02 2.02 2.02 1.02-.36 2.24L18 10l-1.06 1.98.36 2.24-2.02 1.02-1.02 2.02-2.24-.36L10 18.3l-1.98-1.06-2.24.36-1.02-2.02-2.02-1.02.36-2.24L2 10l1.06-1.98-.36-2.24 2.02-1.02L5.74 2.4l2.24.36L10 1.7z"
                />
                <path
                  fill="var(--color-paper)"
                  d="M8.9 12.9L6.7 10.7l.9-.9 1.3 1.3 3.5-3.5.9.9z"
                />
              </svg>
            </span>
          </div>

          <p
            class="kb-review__text"
            :class="{ 'kb-review__text--expanded': expanded.has(review.id) }"
          >
            {{ displayText(review) }}
          </p>
          <button
            type="button"
            class="kb-review__toggle"
            :class="{ 'kb-review__toggle--hidden': !needsToggle(review.text) }"
            :aria-hidden="!needsToggle(review.text)"
            :tabindex="needsToggle(review.text) ? 0 : -1"
            @click="toggleExpanded(review.id)"
          >
            {{ expanded.has(review.id) ? 'Ocultar' : 'Leer más' }}
          </button>
        </article>
      </div>
      </transition>

      <div v-if="!loading && totalPages > 1" class="kb-reviews__nav">
        <button
          type="button"
          class="kb-reviews__nav-btn"
          aria-label="Ver reseñas anteriores"
          @click="prevPage"
        >
          <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
            <path
              d="M11 1L3.5 7L11 13"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
        </button>

        <div class="kb-reviews__dots">
          <span
            v-for="n in totalPages"
            :key="n"
            class="kb-reviews__dot"
            :class="{ 'is-active': page === n - 1 }"
          ></span>
        </div>

        <button
          type="button"
          class="kb-reviews__nav-btn"
          aria-label="Ver más reseñas"
          @click="nextPage"
        >
          <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
            <path
              d="M3 1L10.5 7L3 13"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchGoogleReviews } from '../services/dataService'
import { useAggregateRatingSchema } from '../composables/useAggregateRatingSchema'
import type { GoogleReview } from '../types/api'

defineOptions({
  name: 'GoogleReviews',
})

const props = withDefaults(
  defineProps<{
    /** Cuántas reseñas mostrar como máximo (por defecto, todas las que llegue). */
    limit?: number
    title?: string
  }>(),
  {
    limit: undefined,
    title: 'Lo que dicen de nosotros',
  },
)

const loading = ref(true)
const reviews = ref<GoogleReview[]>([])
const brokenPhotos = ref<Set<string>>(new Set())
const expanded = ref<Set<string>>(new Set())

const visibleReviews = computed(() =>
  props.limit ? reviews.value.slice(0, props.limit) : reviews.value,
)

// Las fotos de perfil de Google llegan pedidas a 120px (p. ej.
// "...=s120-c-rp-mo-br100"), pero el avatar solo se muestra a 44px: se
// pide directamente el tamaño que hace falta (88px, el doble para
// pantallas retina) cambiando ese parámetro en la propia URL de Google, sin
// tocar el backend. Si la URL no tiene ese formato exacto (foto por
// defecto, formato distinto...), se deja tal cual.
function avatarSrc(url: string): string {
  return url.replace(/=s\d+-/, '=s88-')
}

// La valoración agregada de los datos estructurados representa el negocio
// real en Google, no solo lo que este componente decida mostrar: se calcula
// siempre sobre el total de reseñas recibidas (`reviews`), no sobre
// `visibleReviews` (que puede venir recortada por la prop `limit`).
const aggregateRating = computed(() => {
  if (!reviews.value.length) return null
  const sum = reviews.value.reduce((total, review) => total + parseFloat(review.rating), 0)
  return {
    ratingValue: Math.round((sum / reviews.value.length) * 10) / 10,
    reviewCount: reviews.value.length,
  }
})

useAggregateRatingSchema(aggregateRating)

// Se muestran de 3 en 3, con botones para pasar a las siguientes/anteriores,
// igual que el widget de reseñas de la propia web de Kanbouri. Si el total no
// es múltiplo de 3, se descartan las últimas (sobrantes) para no dejar una
// página final con una o dos tarjetas sueltas.
const PAGE_SIZE = 3
const page = ref(0)

const pageableReviews = computed(() => {
  const fullPagesCount = Math.floor(visibleReviews.value.length / PAGE_SIZE) * PAGE_SIZE
  return visibleReviews.value.slice(0, fullPagesCount)
})

const totalPages = computed(() => Math.max(1, pageableReviews.value.length / PAGE_SIZE))

const pagedReviews = computed(() => {
  const start = page.value * PAGE_SIZE
  return pageableReviews.value.slice(start, start + PAGE_SIZE)
})

function nextPage() {
  page.value = (page.value + 1) % totalPages.value
}

function prevPage() {
  page.value = (page.value - 1 + totalPages.value) % totalPages.value
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function starCount(rating: string): number {
  return Math.round(parseFloat(rating)) || 0
}

// Aproximación por longitud de texto (~45 caracteres por línea a 5 líneas)
// para no mostrar "Leer más" en reseñas que ya se ven completas.
const TRUNCATE_THRESHOLD = 220

function needsToggle(text: string): boolean {
  return text.length > TRUNCATE_THRESHOLD
}

/**
 * Recorte en JS (en vez de "-webkit-line-clamp") para no depender de la
 * elipsis automática del navegador y no mostrar puntos suspensivos: se
 * corta en el último espacio antes del límite. Al recortar se colapsan los
 * saltos de párrafo en espacios simples para que todas las tarjetas
 * truncadas ocupen la misma altura (y así "Leer más" quede a la misma
 * altura); al expandir se recupera el texto original con sus párrafos.
 */
function displayText(review: GoogleReview): string {
  if (expanded.value.has(review.id) || !needsToggle(review.text)) return review.text
  const collapsed = review.text.replace(/\s+/g, ' ').trim()
  const cut = collapsed.slice(0, TRUNCATE_THRESHOLD)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()
}

function formattedDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    parsed,
  )
}

function onPhotoError(id: string) {
  brokenPhotos.value.add(id)
}

// Solo una reseña puede estar expandida a la vez: al abrir una se cierra
// cualquier otra que estuviera abierta.
function toggleExpanded(id: string) {
  expanded.value = expanded.value.has(id) ? new Set() : new Set([id])
}

onMounted(async () => {
  try {
    reviews.value = await fetchGoogleReviews()
  } catch (err) {
    console.error('Error fetching Google reviews:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.kb-reviews {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-reviews__inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.kb-reviews__intro {
  max-width: 640px;
  margin: 0 auto clamp(32px, 5vw, 48px);
  text-align: center;
}

.kb-reviews__intro.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base);
}

.kb-reviews__intro.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.kb-reviews__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  background: var(--color-rose-soft-wash);
  color: var(--color-rose-hover);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 14px;
}

.kb-reviews__title {
  margin: 0;
}

/* Flexbox (no grid) + justify-content:center a propósito: cada página
   muestra siempre 3 reseñas (PAGE_SIZE), así que en el corte de tablet (2
   columnas) la tercera queda sola en su propia fila. Con grid esa tarjeta
   suelta se quedaba pegada al lateral izquierdo; con flex-wrap se centra
   sola en su fila, que es como debe verse. */
.kb-reviews__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: start;
  gap: 24px;
}

.kb-review,
.kb-reviews__skeleton {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  flex: 1 1 calc((100% - 48px) / 3);
  max-width: calc((100% - 48px) / 3);
}

.kb-reviews__skeleton {
  min-height: 220px;
  position: relative;
  overflow: hidden;
}

.kb-reviews__skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--color-line), transparent);
  animation: kb-reviews-shimmer 1.4s infinite;
}

@keyframes kb-reviews-shimmer {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

.kb-review {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 22px 24px 20px;
  transition: transform var(--dur-base) var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-review:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-popover);
    border-color: transparent;
  }
}

.kb-review.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-review.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (hover: hover) and (pointer: fine) {
  .kb-review.kb-animate-onscroll.is-visible:hover {
    transform: translateY(-3px);
  }
}

/* ---------- Cabecera: icono de Google + avatar + nombre/fecha ---------- */
.kb-review__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.kb-review__avatar-wrap {
  position: relative;
}

.kb-review__google-icon {
  position: absolute;
  bottom: 0;
  right: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-paper);
  box-shadow: 0 0 0 2px var(--color-paper);
  z-index: 1;
}

.kb-review__avatar-img,
.kb-review__avatar-fallback {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.kb-review__avatar-img {
  object-fit: cover;
  background: var(--color-line);
}

.kb-review__avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-rose);
  color: var(--color-on-rose);
  font-size: 14px;
  font-weight: 600;
}

.kb-review__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  max-width: 100%;
}

.kb-review__name {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-heading);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kb-review__date {
  font-size: 12px;
  color: var(--color-secondary);
}

/* ---------- Estrellas + verificado ---------- */
.kb-review__stars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #f0a93a;
  margin-bottom: 14px;
}

/* Visible solo para lectores de pantalla: da la valoración en texto donde
   las estrellas son puramente decorativas (aria-hidden). */
.kb-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.kb-review__verified {
  display: inline-flex;
  margin-left: 4px;
  color: #4285f4;
}

/* ---------- Texto + leer más ---------- */
.kb-review__text {
  color: var(--color-ink);
  line-height: 1.6;
  font-size: 14.5px;
  white-space: pre-line;
  text-align: center;
  height: 8em;
  overflow: hidden;
}

.kb-review__text--expanded {
  height: auto;
  overflow: visible;
}

.kb-review__toggle {
  align-self: center;
  margin-top: 8px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-rose-hover);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-review__toggle:hover {
    color: var(--color-rose);
    text-decoration: underline;
  }
}

.kb-review__toggle--hidden {
  visibility: hidden;
  pointer-events: none;
}

/* ---------- Transición al cambiar de página ---------- */
.kb-reviews-fade-enter-active,
.kb-reviews-fade-leave-active {
  transition: opacity 260ms var(--ease-base);
}

.kb-reviews-fade-enter-from,
.kb-reviews-fade-leave-to {
  opacity: 0;
}

/* ---------- Navegación: anterior / puntos / siguiente ---------- */
.kb-reviews__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: clamp(28px, 4vw, 40px);
}

.kb-reviews__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--color-rose-soft-wash);
  color: var(--color-rose-hover);
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base),
    color var(--dur-base) var(--ease-base), transform var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-reviews__nav-btn:hover {
    background: var(--color-rose);
    color: var(--color-on-rose);
    transform: translateY(-1px);
  }
}

.kb-reviews__nav-btn:active {
  transform: translateY(0) scale(0.95);
}

.kb-reviews__dots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kb-reviews__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-line);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base);
}

.kb-reviews__dot.is-active {
  background: var(--color-rose);
  transform: scale(1.3);
}

/* ---------- Responsive ---------- */
@media (max-width: 960px) {
  .kb-review,
  .kb-reviews__skeleton {
    flex-basis: calc((100% - 24px) / 2);
    max-width: calc((100% - 24px) / 2);
  }
}

@media (max-width: 640px) {
  .kb-review,
  .kb-reviews__skeleton {
    flex-basis: 100%;
    max-width: 100%;
  }
}
</style>
