<script setup lang="ts">
defineOptions({
  name: 'CollaborationsBand',
})

const universities = [
  { name: 'UNIR', logo: '/images/logo-unir.svg', href: 'https://www.unir.net/' },
  { name: 'UNIE', logo: '/images/logo-unie.webp', href: 'https://www.universidadunie.com/' },
  { name: 'Universidad Isabel I', logo: '/images/logo-isabel-i.svg', href: 'https://www.ui1.es/' },
]
</script>

<template>
  <section class="kb-collab">
    <div class="kb-collab__inner">
      <div class="kb-collab__intro" v-animate-on-scroll>
        <p class="kb-collab__eyebrow text-secondary">Universidades colaboradoras</p>
        <h2 class="kb-collab__title text-h2">Colaboramos Con</h2>
      </div>

      <div class="kb-collab__list" v-animate-on-scroll>
        <a
          v-for="uni in universities"
          :key="uni.name"
          :href="uni.href"
          target="_blank"
          rel="noopener noreferrer"
          class="kb-collab__card"
          v-ripple
          :aria-label="uni.name"
        >
          <img :src="uni.logo" :alt="uni.name" class="kb-collab__logo" loading="lazy" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kb-collab {
  background: var(--color-paper);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-collab__inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.kb-collab__intro {
  max-width: 56ch;
  margin: 0 auto 48px;
  text-align: center;
}

.kb-collab__intro.kb-animate-onscroll,
.kb-collab__list.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base);
}

.kb-collab__intro.kb-animate-onscroll.is-visible,
.kb-collab__list.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.kb-collab__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-rose-hover);
  margin-bottom: 12px;
}

.kb-collab__title {
  margin: 0;
}

.kb-collab__list {
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
}

.kb-collab__card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 100px;
  padding: 16px 28px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  transition: transform var(--dur-base) var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-collab__card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-popover);
  border-color: transparent;
}

.kb-collab__logo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: grayscale(1);
  opacity: 0.65;
  transition: filter var(--dur-base) var(--ease-base), opacity var(--dur-base) var(--ease-base);
}

.kb-collab__card:hover .kb-collab__logo {
  filter: grayscale(0);
  opacity: 1;
}

/* ---------- Responsive ---------- */
@media (max-width: 640px) {
  .kb-collab__card {
    width: 150px;
    height: 80px;
    padding: 12px 20px;
  }
}
</style>
