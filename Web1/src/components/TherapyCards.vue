<template>
  <section id="terapias" class="kb-therapies">
    <div class="kb-therapies__inner">
      <div class="kb-therapies__intro">
        <p class="kb-therapies__eyebrow text-secondary">Terapias en Dénia</p>
        <h2 class="kb-therapies__title text-h2">Terapia psicológica en Dénia para cada etapa de la vida</h2>
        <p class="kb-therapies__lead text-body">
          Cuatro espacios terapéuticos —infantil, adolescentes, adultos y
          pareja— con sesiones presenciales en Dénia y terapia online desde
          donde estés.
        </p>
      </div>

      <div
        v-if="cards.length"
        ref="carouselEl"
        class="kb-therapies__carousel"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Terapias"
        @mouseenter="isHoverPaused = true"
        @mouseleave="isHoverPaused = false"
        @focusin="isHoverPaused = true"
        @focusout="handleFocusOut"
      >
        <div class="kb-therapies__viewport">
          <div
            class="kb-therapies__track"
            :style="trackStyle"
            @transitionend="handleTransitionEnd"
          >
            <div
              v-for="slide in slides"
              :key="slide.key"
              class="kb-therapies__slide"
              :style="{ flexBasis: slideBasis }"
              :aria-hidden="slide.isClone ? 'true' : undefined"
              :inert="slide.isClone"
            >
              <article
                class="kb-card"
                v-animate-on-scroll
                v-spotlight
              >
                <div class="kb-card__media">
                  <img
                    :src="slide.card.imageUrl"
                    :alt="slide.card.title"
                    class="kb-card__image"
                    loading="lazy"
                    :style="slide.card.imagePosition ? { objectPosition: slide.card.imagePosition } : undefined"
                  />
                </div>

                <div class="kb-card__body">
                  <h3 class="kb-card__title text-h3">{{ slide.card.title }}</h3>
                  <p class="kb-card__desc text-secondary">{{ slide.card.description }}</p>

                  <router-link
                    :to="slide.card.href"
                    class="kb-card__link text-cta"
                    :tabindex="slide.isClone ? -1 : undefined"
                    v-ripple
                  >
                    {{ slide.card.buttonText }}
                  </router-link>
                </div>
              </article>
            </div>
          </div>
        </div>

        <button
          v-if="canLoop"
          type="button"
          class="kb-therapies__arrow kb-therapies__arrow--prev"
          aria-label="Terapia anterior"
          @click="handlePrev"
        >
          <ChevronIcon class="kb-therapies__arrow-icon kb-therapies__arrow-icon--prev" />
        </button>
        <button
          v-if="canLoop"
          type="button"
          class="kb-therapies__arrow kb-therapies__arrow--next"
          aria-label="Siguiente terapia"
          @click="handleNext"
        >
          <ChevronIcon class="kb-therapies__arrow-icon kb-therapies__arrow-icon--next" />
        </button>
      </div>

      <div v-if="canLoop" class="kb-therapies__controls">
        <div class="kb-therapies__dots" role="tablist" aria-label="Seleccionar terapia">
          <button
            v-for="(card, dotIndex) in cards"
            :key="card.title"
            type="button"
            class="kb-therapies__dot"
            role="tab"
            :class="{ 'is-active': activeDot === dotIndex }"
            :aria-selected="activeDot === dotIndex"
            :aria-label="`Ir a ${card.title}`"
            @click="handleGoTo(dotIndex)"
          ></button>
        </div>

        <button
          type="button"
          class="kb-therapies__playpause"
          :aria-label="isPaused ? 'Reanudar el carrusel' : 'Pausar el carrusel'"
          @click="togglePlayPause"
        >
          <span v-if="isPaused" aria-hidden="true">▶</span>
          <span v-else aria-hidden="true">❚❚</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineComponent, h } from 'vue'

type TherapyCard = {
  title: string
  description: string
  imageUrl: string
  buttonText: string
  href: string
  /**
   * Override del punto de enfoque del recorte (mismo formato que la
   * propiedad CSS `object-position`, p. ej. "center 85%"). Por defecto
   * todas las tarjetas usan "center 20%" (ver .kb-card__image); útil para
   * fotos verticales donde el punto de interés no está en la parte de
   * arriba, como las manos entrelazadas de la tarjeta de Duelo.
   */
  imagePosition?: string
}

const props = defineProps<{
  cards: TherapyCard[]
}>()

/**
 * Icono de flecha (mismo trazo fino que el del Header) para no depender de
 * librerías de iconos externas.
 */
const ChevronIcon = defineComponent({
  render() {
    return h(
      'svg',
      { viewBox: '0 0 10 6', width: 10, height: 6, fill: 'none', 'aria-hidden': 'true' },
      [
        h('path', {
          d: 'M1 1L5 5L9 1',
          stroke: 'currentColor',
          'stroke-width': 1.4,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
      ],
    )
  },
})

const AUTOPLAY_MS = 4500
const BREAKPOINT_MOBILE = 640
const BREAKPOINT_TABLET = 1080

const carouselEl = ref<HTMLElement | null>(null)
const itemsPerView = ref(3)
const index = ref(3)
const isTransitioning = ref(true)
const isPaused = ref(false)
const isHoverPaused = ref(false)
const prefersReducedMotion = ref(false)

const canLoop = computed(() => props.cards.length > itemsPerView.value)

type Slide = { card: TherapyCard; key: string; isClone: boolean }

const slides = computed<Slide[]>(() => {
  if (!props.cards.length) return []
  if (!canLoop.value) {
    return props.cards.map((card, i) => ({ card, key: `real-${i}`, isClone: false }))
  }

  const n = itemsPerView.value
  const head = props.cards.slice(-n).map((card, i) => ({ card, key: `head-${i}`, isClone: true }))
  const middle = props.cards.map((card, i) => ({ card, key: `real-${i}`, isClone: false }))
  const tail = props.cards.slice(0, n).map((card, i) => ({ card, key: `tail-${i}`, isClone: true }))
  return [...head, ...middle, ...tail]
})

const slideBasis = computed(() => {
  const n = canLoop.value
    ? itemsPerView.value
    : Math.max(1, Math.min(itemsPerView.value, props.cards.length))
  return `${100 / n}%`
})

const trackStyle = computed(() => {
  if (!canLoop.value) return { transform: 'none', transition: 'none' }
  return {
    transform: `translateX(-${index.value * (100 / itemsPerView.value)}%)`,
    transition: isTransitioning.value ? 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
  }
})

const activeDot = computed(() => {
  const total = props.cards.length
  if (!total) return 0
  return (((index.value - itemsPerView.value) % total) + total) % total
})

function snapTo(newIndex: number) {
  isTransitioning.value = false
  index.value = newIndex
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isTransitioning.value = true
    })
  })
}

function handleTransitionEnd(event: TransitionEvent) {
  // "transitionend" burbujea: sin este filtro, la transición de cualquier
  // hijo (el hover de una tarjeta, el fondo del botón de flecha al
  // pulsarlo...) también dispara este handler, cortando el snap de vuelta
  // al principio a mitad de la animación real del track.
  if (event.target !== event.currentTarget || event.propertyName !== 'transform') return
  if (!canLoop.value) return
  const n = itemsPerView.value
  const total = props.cards.length
  if (index.value >= n + total) {
    snapTo(index.value - total)
  } else if (index.value < n) {
    snapTo(index.value + total)
  }
}

function next() {
  if (!canLoop.value) return
  isTransitioning.value = true
  index.value += 1
}

function handleNext() {
  next()
  restartAutoplay()
}

function handlePrev() {
  if (!canLoop.value) return
  isTransitioning.value = true
  index.value -= 1
  restartAutoplay()
}

function handleGoTo(dotIndex: number) {
  if (!canLoop.value) return
  isTransitioning.value = true
  index.value = itemsPerView.value + dotIndex
  restartAutoplay()
}

function togglePlayPause() {
  isPaused.value = !isPaused.value
  if (!isPaused.value) restartAutoplay()
}

function handleFocusOut(event: FocusEvent) {
  const related = event.relatedTarget as Node | null
  if (!carouselEl.value?.contains(related)) isHoverPaused.value = false
}

function updateItemsPerView() {
  const width = window.innerWidth
  const next = width <= BREAKPOINT_MOBILE ? 1 : width <= BREAKPOINT_TABLET ? 2 : 3
  if (next === itemsPerView.value) return
  itemsPerView.value = next
  snapTo(next)
}

function tick() {
  if (!canLoop.value) return
  if (isPaused.value || isHoverPaused.value || prefersReducedMotion.value) return
  if (typeof document !== 'undefined' && document.hidden) return
  next()
}

let autoplayTimer: ReturnType<typeof setInterval> | undefined

function restartAutoplay() {
  clearInterval(autoplayTimer)
  autoplayTimer = setInterval(tick, AUTOPLAY_MS)
}

onMounted(() => {
  updateItemsPerView()
  if (typeof window.matchMedia === 'function') {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  window.addEventListener('resize', updateItemsPerView)
  restartAutoplay()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateItemsPerView)
  clearInterval(autoplayTimer)
})
</script>

<style scoped>
.kb-therapies {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-therapies__inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.kb-therapies__intro {
  max-width: 56ch;
  margin: 0 auto 48px;
  text-align: center;
}

.kb-therapies__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-rose-hover);
  margin-bottom: 12px;
}

.kb-therapies__title {
  margin-bottom: 14px;
}

.kb-therapies__lead {
  color: var(--color-ink);
}

/* ---------- Carrusel ---------- */
.kb-therapies__carousel {
  position: relative;
}

.kb-therapies__viewport {
  overflow: hidden;
  /* Compensa el padding exterior de la primera/última tarjeta (ver
     .kb-therapies__slide) para que sigan quedando a ras del contenedor. */
  margin: 0 -12px;
}

.kb-therapies__track {
  display: flex;
  align-items: stretch;
}

.kb-therapies__slide {
  flex-shrink: 0;
  min-width: 0;
  /* El espacio entre tarjetas se resuelve con padding, no con `gap`: un
     `gap` en un flex-item con flex-basis en porcentaje NO se descuenta del
     cálculo de ese porcentaje, así que cada `translateX` calculado en % se
     quedaba corta por el ancho del gap. El desfase se acumulaba en cada
     paso (24px, 48px, 72px...), dejando la tarjeta visible cada vez más
     cortada — más notorio en móvil, donde 24px es una fracción grande del
     ancho de pantalla. Con padding en vez de gap, el % es exacto siempre.
  */
  box-sizing: border-box;
  padding: 0 12px;
}

.kb-therapies__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--color-line);
  background: var(--color-paper);
  color: var(--color-rose-hover);
  cursor: pointer;
  box-shadow: var(--shadow-popover);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base);
  z-index: 2;
}

@media (hover: hover) and (pointer: fine) {
  .kb-therapies__arrow:hover {
    background: var(--color-rose-soft-wash);
  }
}

.kb-therapies__arrow--prev {
  left: -22px;
}

.kb-therapies__arrow--next {
  right: -22px;
}

.kb-therapies__arrow-icon {
  width: 12px;
  height: 8px;
}

.kb-therapies__arrow-icon--prev {
  transform: rotate(90deg);
}

.kb-therapies__arrow-icon--next {
  transform: rotate(-90deg);
}

.kb-therapies__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 28px;
}

.kb-therapies__dots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kb-therapies__dot {
  width: 9px;
  height: 9px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: var(--color-line);
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base), transform var(--dur-base) var(--ease-base);
}

.kb-therapies__dot.is-active {
  background: var(--color-rose);
  transform: scale(1.2);
}

.kb-therapies__playpause {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--color-line);
  background: var(--color-paper);
  color: var(--color-rose-hover);
  font-size: 10px;
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-therapies__playpause:hover {
    background: var(--color-rose-soft-wash);
  }
}

.kb-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 100%;
  transition: transform var(--dur-base) var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-popover);
    border-color: transparent;
  }
}

/* Entrada al hacer scroll: fundido + desplazamiento vertical más marcado,
   con transición propia (más lenta) para que se note bien la aparición. */
.kb-card.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 650ms var(--ease-base), transform 650ms var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-card.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (hover: hover) and (pointer: fine) {
  /* Una vez visible, el hover recupera la velocidad rápida habitual. */
  .kb-card.kb-animate-onscroll.is-visible:hover {
    transform: translateY(-4px);
    transition: transform var(--dur-base) var(--ease-base),
      box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
  }
}

.kb-card__media {
  width: 100%;
  overflow: hidden;
}

.kb-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: center 20%;
  transform: scale(1);
  transition: transform var(--dur-slow) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-card:hover .kb-card__image {
    transform: scale(1.06);
  }
}

.kb-card__body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  padding: 24px 22px 26px;
  width: 100%;
}

.kb-card__title {
  margin-bottom: 10px;
}

.kb-card__desc {
  margin-bottom: 22px;
  line-height: 1.55;
}

.kb-card__link {
  display: inline-flex;
  align-items: center;
  margin-top: auto;
  padding: 11px 24px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-card__link:hover {
    background: var(--color-rose-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-cta-hover);
  }
}

.kb-card__link:active {
  transform: translateY(0) scale(0.97);
  box-shadow: var(--shadow-cta);
}

/* ---------- Responsive ---------- */
@media (max-width: 1080px) {
  .kb-therapies__arrow--prev {
    left: 4px;
  }

  .kb-therapies__arrow--next {
    right: 4px;
  }
}

@media (max-width: 560px) {
  .kb-therapies__arrow {
    width: 36px;
    height: 36px;
  }
}
</style>
