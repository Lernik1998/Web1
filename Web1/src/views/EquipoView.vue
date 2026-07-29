<script setup lang="ts">
import { team } from '../data/team'

defineOptions({
  name: 'EquipoView',
})
</script>

<template>
  <section class="kb-team">
    <div class="kb-team__header">
      <h1 class="kb-team__title text-h1">Nuestro equipo</h1>
      <p class="kb-team__lead text-body">
        Un equipo de psicólogas cercano y diverso, con un objetivo común:
        acompañarte con calidez y profesionalidad en cada etapa.
      </p>
    </div>

    <div class="kb-team__grid">
      <article
        v-for="(member, i) in team"
        :key="member.slug"
        class="kb-team-card"
        v-animate-on-scroll
        v-spotlight
        :style="{ transitionDelay: `${i * 100}ms` }"
      >
        <router-link :to="`/equipo/${member.slug}`" class="kb-team-card__media">
          <img
            :src="member.image"
            :alt="member.name"
            class="kb-team-card__image"
            :style="{
              '--img-scale': member.imageScale ?? 1,
              objectPosition: member.imagePosition,
            }"
          />
        </router-link>
        <router-link :to="`/equipo/${member.slug}`" class="kb-team-card__name-link">
          <h3 class="kb-team-card__name text-h3">{{ member.name }}</h3>
        </router-link>
        <p class="kb-team-card__role text-secondary">Psicóloga</p>

        <router-link :to="`/equipo/${member.slug}`" class="kb-team-card__link text-cta" v-ripple>
          Más sobre {{ member.name.split(' ')[0] }}
        </router-link>
      </article>
    </div>
  </section>
</template>

<style scoped>
.kb-team {
  background: var(--color-paper-alt);
  padding: clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px);
}

.kb-team__header {
  max-width: 640px;
  margin: 0 auto 28px;
  text-align: center;
}

.kb-team__title {
  margin-bottom: 10px;
}

.kb-team__lead {
  color: var(--color-ink);
}

.kb-team__grid {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.kb-team-card {
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

.kb-team-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-popover);
  border-color: transparent;
}

.kb-team-card.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-team-card.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.kb-team-card.kb-animate-onscroll.is-visible:hover {
  transform: translateY(-4px);
  transition: transform var(--dur-base) var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-team-card__media {
  display: block;
  width: 100%;
  overflow: hidden;
}

.kb-team-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  object-position: center 20%;
  transform: scale(var(--img-scale, 1));
  transition: transform var(--dur-slow) var(--ease-base);
}

.kb-team-card:hover .kb-team-card__image {
  transform: scale(calc(var(--img-scale, 1) * 1.05));
}

.kb-team-card__name-link {
  text-decoration: none;
}

.kb-team-card__name {
  margin: 14px 0 2px;
  transition: color var(--dur-base) var(--ease-base);
}

.kb-team-card__name-link:hover .kb-team-card__name {
  color: var(--color-rose-hover);
}

.kb-team-card__role {
  margin-bottom: 14px;
}

.kb-team-card__link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 18px;
  padding: 11px 24px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

.kb-team-card__link:hover {
  background: var(--color-rose-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-team-card__link:active {
  transform: translateY(0) scale(0.97);
  box-shadow: var(--shadow-cta);
}

/* ---------- Responsive ---------- */
@media (max-width: 860px) {
  .kb-team__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .kb-team__grid {
    grid-template-columns: 1fr;
    max-width: 360px;
  }
}
</style>
