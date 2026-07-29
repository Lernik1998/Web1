<template>
  <section id="terapias" class="kb-therapies">
    <div class="kb-therapies__inner">
      <div class="kb-therapies__intro">
        <p class="kb-therapies__eyebrow text-secondary">Servicios</p>
        <h2 class="kb-therapies__title text-h2">Te acompañamos en cada etapa</h2>
        <p class="kb-therapies__lead text-body">
          Cuatro espacios terapéuticos pensados para adaptarse a cada momento
          vital, en Dénia o desde donde estés.
        </p>
      </div>

      <div class="kb-therapies__grid">
        <article
          v-for="(card, i) in cards"
          :key="card.title"
          class="kb-card"
          v-animate-on-scroll
          v-spotlight
          :style="{ transitionDelay: `${i * 100}ms` }"
        >
          <div class="kb-card__media">
            <img :src="card.imageUrl" :alt="card.title" class="kb-card__image" />
          </div>

          <div class="kb-card__body">
            <h3 class="kb-card__title text-h3">{{ card.title }}</h3>
            <p class="kb-card__desc text-secondary">{{ card.description }}</p>

            <router-link :to="card.href" class="kb-card__link text-cta" v-ripple>
              {{ card.buttonText }}
            </router-link>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  cards: Array<{
    title: string
    description: string
    imageUrl: string
    buttonText: string
    href: string
  }>
}>()
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
  overflow: hidden;
  transition: transform var(--dur-base) var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-popover);
  border-color: transparent;
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

/* Una vez visible, el hover recupera la velocidad rápida habitual. */
.kb-card.kb-animate-onscroll.is-visible:hover {
  transform: translateY(-4px);
  transition: transform var(--dur-base) var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
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

.kb-card:hover .kb-card__image {
  transform: scale(1.06);
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
