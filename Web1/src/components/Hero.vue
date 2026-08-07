<template>
  <section class="kb-hero" v-spotlight>
    <div class="kb-hero__inner">
      <div class="kb-hero__content kb-hero__reveal" style="animation-delay: 0ms">
        <h1 class="kb-hero__title text-h1">{{ title }}</h1>

        <p
          v-for="(paragraph, index) in descriptionParagraphs"
          :key="index"
          class="kb-hero__lead text-body"
        >
          {{ paragraph }}
        </p>

        <div class="kb-hero__actions">
          <router-link to="/pedir-cita" class="kb-hero__cta kb-glare text-cta">
            {{ buttonText }}
          </router-link>
          <a href="#terapias" class="kb-hero__link text-cta">
            Ver tipos de terapia
            <span class="kb-hero__link-icon" aria-hidden="true">
              <ArrowIcon />
            </span>
          </a>
        </div>
      </div>

      <div class="kb-hero__media kb-hero__reveal" style="animation-delay: 120ms">
        <div class="kb-hero__blob" aria-hidden="true"></div>
        <img :src="imageUrl" :alt="title" class="kb-hero__image" fetchpriority="high" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'

defineOptions({
  name: 'HeroSection',
})

const props = defineProps<{
  title: string
  description: string
  imageUrl: string
  buttonText: string
}>()

// El ACF de WordPress manda la descripción como un único texto con párrafos
// separados por una línea en blanco.
const descriptionParagraphs = computed(() =>
  props.description.split(/\r?\n\s*\r?\n/).filter(Boolean),
)

/** Flecha para el badge circular del enlace secundario del hero. */
const ArrowIcon = defineComponent({
  render() {
    return h(
      'svg',
      { viewBox: '0 0 14 14', width: 14, height: 14, fill: 'none', 'aria-hidden': 'true' },
      [
        h('path', {
          d: 'M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5',
          stroke: 'currentColor',
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
      ]
    )
  },
})
</script>

<style scoped>
.kb-hero {
  position: relative;
  background: var(--color-paper);
  padding: clamp(48px, 8vw, 96px) clamp(20px, 4vw, 48px) clamp(64px, 9vw, 120px);
  overflow: hidden;
}

.kb-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 88% -8%, var(--color-paper-alt) 0%, transparent 50%),
    radial-gradient(circle at -8% 108%, var(--color-line) 0%, transparent 45%);
  opacity: 0.7;
  pointer-events: none;
  z-index: 0;
}

.kb-hero__inner {
  position: relative;
  z-index: 1;
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
  align-items: center;
  gap: clamp(32px, 6vw, 80px);
}

@keyframes kb-hero-fade-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kb-hero__reveal {
  animation: kb-hero-fade-in 700ms var(--ease-base) both;
}

/* ---------- Columna de texto ---------- */
.kb-hero__title {
  margin-bottom: 22px;
}

.kb-hero__lead {
  max-width: 46ch;
  margin-bottom: 20px;
}

.kb-hero__lead:last-of-type {
  margin-bottom: 32px;
}

.kb-hero__actions {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

.kb-hero__cta {
  display: inline-flex;
  align-items: center;
  padding: 14px 30px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

.kb-hero__cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-hero__cta:active {
  transform: translateY(0) scale(0.97);
  box-shadow: var(--shadow-cta);
}

.kb-hero__link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-heading);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  padding-bottom: 2px;
  transition: color var(--dur-base) var(--ease-base);
}

.kb-hero__link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-rose-soft-wash);
  color: var(--color-rose-hover);
  transition: background-color var(--dur-base) var(--ease-base),
    color var(--dur-base) var(--ease-base), transform var(--dur-base) var(--ease-base);
}

.kb-hero__link:hover {
  color: var(--color-rose-hover);
}

.kb-hero__link:hover .kb-hero__link-icon {
  background: var(--color-rose);
  color: var(--color-on-rose);
  transform: translateX(3px);
}

.kb-hero__link:active .kb-hero__link-icon {
  transform: translateX(1px) scale(0.95);
}

/* ---------- Columna de imagen ---------- */
.kb-hero__media {
  position: relative;
  justify-self: center;
  width: 100%;
  max-width: 460px;
}

.kb-hero__blob {
  position: absolute;
  inset: 0;
  transform: translate(10px, 10px);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-rose-soft) 0%, var(--color-secondary) 100%);
  opacity: 0.45;
  z-index: 0;
}

.kb-hero__image {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  aspect-ratio: 1200 / 930;
  object-fit: cover;
  object-position: center 20%;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  background: var(--color-paper-alt); /* placeholder mientras carga la foto real */
}

/* ---------- Responsive ---------- */
@media (max-width: 860px) {
  .kb-hero__inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .kb-hero__lead {
    margin-left: auto;
    margin-right: auto;
  }

  .kb-hero__actions {
    justify-content: center;
  }

  .kb-hero__media {
    order: -1;
    max-width: 280px;
  }
}
</style>