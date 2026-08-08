<template>
  <section class="kb-not-found">
    <div class="kb-not-found__inner">
      <p class="kb-not-found__code">404</p>
      <h1 class="kb-not-found__title text-h1">Esta página no existe</h1>
      <p class="kb-not-found__lead text-body">
        Puede que el enlace esté roto o que la página se haya movido. Vuelve
        al inicio o pide tu cita directamente.
      </p>
      <div class="kb-not-found__actions">
        <router-link to="/" class="kb-not-found__cta kb-glare text-cta">Volver al inicio</router-link>
        <router-link to="/pedir-cita" class="kb-not-found__link text-cta">Pedir cita</router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSeoMeta } from '../composables/useSeoMeta'

defineOptions({
  name: 'NotFoundView',
})

useSeoMeta(() => ({
  title: 'Página no encontrada',
  description: 'La página que buscas no existe o se ha movido.',
  noindex: true,
}))
</script>

<style scoped>
.kb-not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-not-found__inner {
  max-width: 480px;
  text-align: center;
}

.kb-not-found__code {
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 72px);
  font-weight: 600;
  color: var(--color-rose-hover);
  line-height: 1;
  margin-bottom: 12px;
}

.kb-not-found__title {
  margin-bottom: 14px;
}

.kb-not-found__lead {
  color: var(--color-ink);
  margin-bottom: 32px;
}

.kb-not-found__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.kb-not-found__cta {
  display: inline-flex;
  align-items: center;
  padding: 13px 30px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

.kb-not-found__cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-not-found__link {
  color: var(--color-heading);
  text-decoration: none;
  border-bottom: 1px solid var(--color-line);
  padding-bottom: 2px;
  transition: color var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-not-found__link:hover {
  color: var(--color-rose-hover);
  border-color: var(--color-rose-hover);
}
</style>
