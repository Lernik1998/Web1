<template>
  <section class="kb-hero">
    <div class="kb-hero__inner">
      <div class="kb-hero__content">
        <p class="kb-hero__eyebrow text-secondary">Psicóloga en Dénia</p>

        <h1 class="kb-hero__title text-h1">
          Centro de psicología en Dénia especializado en el acompañamiento
          emocional y terapéutico a lo largo de las distintas etapas de la
          vida
        </h1>

        <p class="kb-hero__lead text-body">
          Un espacio para niños, adultos y parejas que buscan sentirse mejor,
          en Dénia o allá donde estés.
        </p>

        <div class="kb-hero__actions">
          <a href="/pedir-cita" class="kb-hero__cta text-cta">Pedir cita</a>
          <a href="#terapias" class="kb-hero__link text-cta">
            Ver tipos de terapia
            <ArrowIcon />
          </a>
        </div>

        <p class="kb-hero__note text-secondary">
          Consulta presencial en Dénia · Sesiones online en toda España
        </p>
      </div>

      <div class="kb-hero__media">
        <div class="kb-hero__blob" aria-hidden="true"></div>
        <img
          src="/images/psicologa-denia-hero.jpg"
          alt="Psicóloga en Dénia de Kanbouri Psicología, sonriendo en su consulta"
          class="kb-hero__image"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'

/** Flecha fina para el enlace secundario del hero. */
const ArrowIcon = defineComponent({
  render() {
    return h(
      'svg',
      { viewBox: '0 0 16 10', width: 16, height: 10, fill: 'none', 'aria-hidden': 'true' },
      [
        h('path', {
          d: 'M1 5H15M15 5L10.5 1M15 5L10.5 9',
          stroke: 'currentColor',
          'stroke-width': 1.4,
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

.kb-hero::before {
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

/* ---------- Columna de texto ---------- */
.kb-hero__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-rose-hover);
  margin-bottom: 18px;
}

.kb-hero__title {
  margin-bottom: 22px;
}

.kb-hero__lead {
  max-width: 46ch;
  margin-bottom: 32px;
}

.kb-hero__actions {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.kb-hero__note {
  margin: 0;
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
  gap: 8px;
  color: var(--color-heading);
  text-decoration: none;
  border-bottom: 1px solid var(--color-line);
  padding-bottom: 2px;
  transition: border-color var(--dur-base) var(--ease-base), gap var(--dur-base) var(--ease-base),
    color var(--dur-base) var(--ease-base);
}

.kb-hero__link svg {
  transition: transform var(--dur-base) var(--ease-base);
}

.kb-hero__link:hover {
  color: var(--color-rose-hover);
  border-color: var(--color-rose-hover);
  gap: 10px;
}

.kb-hero__link:hover svg {
  transform: translateX(3px);
}

.kb-hero__link:active {
  color: var(--color-heading);
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