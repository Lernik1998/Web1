<script setup lang="ts">
import { computed } from 'vue'
import { team } from '../data/team'

defineOptions({
  name: 'TeamMemberView',
})

const props = defineProps<{
  slug: string
}>()

const member = computed(() => team.find((m) => m.slug === props.slug) ?? null)
</script>

<template>
  <section class="kb-profile">
    <div class="kb-profile__inner">
      <router-link to="/equipo" class="kb-profile__back text-secondary">← Volver al equipo</router-link>

      <template v-if="member">
        <div class="kb-profile__header kb-profile__animate" style="animation-delay: 0ms">
          <div class="kb-profile__media">
            <img
              :src="member.image"
              :alt="member.name"
              class="kb-profile__image"
              :style="{
                '--img-scale': member.imageScale ?? 1,
                objectPosition: member.imagePosition,
              }"
            />
          </div>

          <div class="kb-profile__intro">
            <h1 class="kb-profile__name text-h1">{{ member.name }}</h1>
            <p class="kb-profile__role text-secondary">{{ member.role }}</p>
            <p class="kb-profile__collegiate text-secondary">{{ member.collegiate }}</p>

            <router-link to="/pedir-cita" class="kb-profile__cta text-cta">
              Pedir cita
            </router-link>
          </div>
        </div>

        <div class="kb-profile__card kb-profile__animate" style="animation-delay: 160ms">
          <div class="kb-profile__block">
            <p v-for="(paragraph, index) in member.bio" :key="index" class="text-body">
              {{ paragraph }}
            </p>
          </div>

          <div class="kb-profile__block">
            <h2 class="text-h2">Formación académica</h2>
            <ul class="kb-profile__list">
              <li v-for="(item, index) in member.formacionAcademica" :key="index">{{ item }}</li>
            </ul>
          </div>

          <div class="kb-profile__block">
            <h2 class="text-h2">Formación extracurricular</h2>
            <ul class="kb-profile__list">
              <li v-for="(item, index) in member.formacionExtra" :key="index">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div class="kb-profile__final kb-profile__animate" style="animation-delay: 320ms">
          <router-link to="/pedir-cita" class="kb-profile__cta text-cta">
            Pedir cita
          </router-link>
        </div>
      </template>

      <div v-else class="kb-profile__error">
        <p>No se encontró a esta profesional.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kb-profile {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-profile__inner {
  max-width: 780px;
  margin: 0 auto;
}

.kb-profile__back {
  display: inline-block;
  margin-bottom: 28px;
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-base);
}

.kb-profile__back:hover {
  color: var(--color-rose-hover);
}

@keyframes kb-profile-fade-in {
  from {
    opacity: 0;
    transform: translateY(36px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.kb-profile__animate {
  animation: kb-profile-fade-in 750ms var(--ease-base) both;
}

@media (prefers-reduced-motion: reduce) {
  .kb-profile__animate {
    animation: none;
  }
}

.kb-profile__header {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: clamp(24px, 4vw, 40px);
  align-items: center;
  margin-bottom: clamp(40px, 6vw, 56px);
}

.kb-profile__media {
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
}

.kb-profile__image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: center 20%;
  transform: scale(var(--img-scale, 1));
}

.kb-profile__name {
  margin-bottom: 8px;
}

.kb-profile__role {
  margin-bottom: 2px;
}

.kb-profile__collegiate {
  margin-bottom: 20px;
}

.kb-profile__cta {
  display: inline-flex;
  align-items: center;
  padding: 12px 26px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

.kb-profile__cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-profile__card {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  padding: clamp(28px, 5vw, 48px);
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 4vw, 40px);
}

.kb-profile__block h2 {
  margin-bottom: 12px;
}

.kb-profile__block p {
  line-height: 1.65;
  margin-bottom: 14px;
}

.kb-profile__block p:last-child {
  margin-bottom: 0;
}

.kb-profile__list {
  list-style: disc;
  padding-left: 1.3em;
  display: flex;
  flex-direction: column;
  gap: 8px;
  line-height: 1.55;
}

.kb-profile__final {
  text-align: center;
  margin-top: clamp(40px, 6vw, 56px);
}

.kb-profile__error {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: 24px 28px;
  text-align: center;
}

/* ---------- Responsive ---------- */
@media (max-width: 640px) {
  .kb-profile__header {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .kb-profile__media {
    max-width: 220px;
    margin: 0 auto;
  }
}
</style>
