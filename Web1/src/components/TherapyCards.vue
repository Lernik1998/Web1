<template>
  <section id="terapias" class="kb-therapies">
    <div class="kb-therapies__inner">
      <div class="kb-therapies__intro">
        <h2 class="kb-therapies__title text-h2">Te acompañamos en cada etapa</h2>
        <p class="kb-therapies__lead text-body">
          Cuatro espacios terapéuticos pensados para adaptarse a cada momento
          vital, en Dénia o desde donde estés.
        </p>
      </div>

      <div class="kb-therapies__grid">
        <article v-for="card in cards" :key="card.title" class="kb-card">
          <div class="kb-card__icon" aria-hidden="true">
            <component :is="card.icon" />
          </div>

          <h3 class="kb-card__title text-h3">{{ card.title }}</h3>
          <p class="kb-card__desc text-secondary">{{ card.description }}</p>

          <a :href="card.href" class="kb-card__link text-cta">Me interesa</a>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'

/** Iconos de trazo fino, coherentes con el resto del sitio (sin dependencias externas). */
function svgIcon(children: any, viewBox = '0 0 24 24') {
  return defineComponent({
    render() {
      return h('svg', { viewBox, width: 26, height: 26, fill: 'none', 'aria-hidden': 'true' }, children)
    },
  })
}

const strokeProps = {
  stroke: 'currentColor',
  'stroke-width': 1.5,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
}

// Osito — lectura inmediata de "infancia"
const IconChild = svgIcon([
  h('circle', { cx: 8, cy: 6.2, r: 1.8, ...strokeProps }),
  h('circle', { cx: 16, cy: 6.2, r: 1.8, ...strokeProps }),
  h('circle', { cx: 12, cy: 11, r: 4.4, ...strokeProps }),
  h('path', {
    d: 'M7.2 16.3c0-1.5 2.2-2.5 4.8-2.5s4.8 1 4.8 2.5S14.6 19 12 19s-4.8-1.2-4.8-2.7z',
    ...strokeProps,
  }),
])

// Mariposa — símbolo habitual de transformación / identidad adolescente
const IconTeen = svgIcon([
  h('path', { d: 'M12 6.5v12', ...strokeProps }),
  h('path', { d: 'M12 8.2c-1-3-4-4.6-6-3.6s-1.6 5.2 1 6.6c2 1.1 4 .4 5-1', ...strokeProps }),
  h('path', { d: 'M12 8.2c1-3 4-4.6 6-3.6s1.6 5.2-1 6.6c-2 1.1-4 .4-5-1', ...strokeProps }),
  h('path', { d: 'M12 13c-.8-2-3-3-4.5-2s-1.3 4 .5 5c1.6 1 3.3.2 4-1', ...strokeProps }),
  h('path', { d: 'M12 13c.8-2 3-3 4.5-2s1.3 4-.5 5c-1.6 1-3.3.2-4-1', ...strokeProps }),
  h('path', { d: 'M10.7 6l-1-1.6M13.3 6l1-1.6', ...strokeProps }),
])

// Figura individual en calma — terapia para adultos
const IconAdult = svgIcon([
  h('circle', { cx: 12, cy: 7.3, r: 3.3, ...strokeProps }),
  h('path', { d: 'M5 20.5v-1a7 7 0 0114 0v1', ...strokeProps }),
])

// Adulto y niño de la mano — familia y crianza
const IconFamily = svgIcon([
  h('circle', { cx: 7, cy: 6, r: 2.3, ...strokeProps }),
  h('path', { d: 'M2.2 19.5v-1a4.8 4.8 0 019.6 0v1', ...strokeProps }),
  h('circle', { cx: 17, cy: 9.6, r: 1.8, ...strokeProps }),
  h('path', { d: 'M13.2 19.5v-.7a3.8 3.8 0 017.6 0v.7', ...strokeProps }),
  h('path', { d: 'M10.6 15.7l2.6 1.3', ...strokeProps }),
])

const cards = [
  {
    title: 'Psicología infantil',
    description:
      'Acompañamos a los más pequeños a comprender y gestionar sus emociones a través del juego y la palabra.',
    href: '/terapia-online/infantil',
    icon: IconChild,
  },
  {
    title: 'Psicología para adolescentes',
    description:
      'Un espacio de escucha y confianza para explorar identidad, autoestima y relaciones en esta etapa de cambios.',
    href: '/terapia-online/adolescentes',
    icon: IconTeen,
  },
  {
    title: 'Psicología para adultos',
    description:
      'Terapia para gestionar ansiedad, duelo, autoestima o momentos de transición vital, siempre a tu ritmo.',
    href: '/terapia-online/adultos',
    icon: IconAdult,
  },
  {
    title: 'Psicología para padres y familia',
    description:
      'Herramientas y apoyo para fortalecer la comunicación y el bienestar de todo el núcleo familiar.',
    href: '/terapia-online/padres-familia',
    icon: IconFamily,
  },
]
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

.kb-therapies__title {
  margin-bottom: 14px;
}

.kb-therapies__lead {
  color: var(--color-ink);
}

.kb-therapies__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.kb-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 28px 24px 26px;
  transition: transform var(--dur-base) var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-popover);
  border-color: transparent;
}

.kb-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--color-rose-soft-wash);
  color: var(--color-rose-hover);
  margin-bottom: 20px;
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

.kb-card__link:hover {
  background: var(--color-rose-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-card__link:active {
  transform: translateY(0) scale(0.97);
  box-shadow: var(--shadow-cta);
}

/* ---------- Responsive ---------- */
@media (max-width: 1080px) {
  .kb-therapies__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .kb-therapies__grid {
    grid-template-columns: 1fr;
  }
}
</style>