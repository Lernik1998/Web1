<script setup lang="ts">
defineOptions({
  name: 'AdultosView',
})

const areas = [
  { label: 'Ansiedad', href: '/terapia-online/adultos/ansiedad' },
  { label: 'Depresión y estado de ánimo', href: '/terapia-online/adultos/depresion' },
  { label: 'Autoestima y desarrollo personal', href: '/terapia-online/adultos/autoestima' },
  { label: 'Duelo y pérdidas', href: '/terapia-online/adultos/duelo' },
]
</script>

<template>
  <section class="kb-therapy">
    <div class="kb-therapy__header">
      <h1 class="kb-therapy__title text-h1">Psicología para adultos</h1>
      <p class="kb-therapy__lead text-body">
        Terapia para gestionar ansiedad, duelo, autoestima o momentos de
        transición vital, siempre a tu ritmo.
      </p>
    </div>

    <div class="kb-therapy__card">
      <div class="kb-therapy__block">
        <h2 class="text-h2">Áreas que trabajamos</h2>
        <div class="kb-pill-group">
          <router-link
            v-for="area in areas"
            :key="area.href"
            :to="area.href"
            class="kb-pill"
          >
            {{ area.label }}
          </router-link>
        </div>
      </div>

      <div class="kb-therapy__block">
        <h2 class="text-h2">Cómo trabajamos</h2>
        <p class="text-body">
          Trabajamos desde un enfoque cercano y humano, donde el vínculo
          terapéutico es una pieza central del proceso: escucha sin juicio,
          presencia y respeto por el ritmo de cada persona.
        </p>
      </div>
    </div>

    <div class="kb-therapy__final">
      <router-link
        :to="{ path: '/pedir-cita', query: { servicio: 'adultos' } }"
        class="kb-therapy__cta text-cta"
      >
        Pedir cita
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.kb-therapy {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-therapy__header {
  max-width: 640px;
  margin: 0 auto 48px;
  text-align: center;
}

.kb-therapy__title {
  margin-bottom: 14px;
}

.kb-therapy__lead {
  color: var(--color-ink);
}

.kb-therapy__card {
  max-width: 760px;
  margin: 0 auto;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  padding: clamp(28px, 5vw, 48px);
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 4vw, 40px);
}

.kb-therapy__block {
  text-align: center;
}

.kb-therapy__block h2 {
  margin-bottom: 14px;
}

.kb-therapy__block p {
  max-width: 56ch;
  margin: 0 auto;
  line-height: 1.65;
}

.kb-pill-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.kb-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  font-size: 14px;
  color: var(--color-ink);
  background: var(--color-rose-soft-wash);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base),
    border-color var(--dur-base) var(--ease-base), color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base);
}

.kb-pill:hover {
  background: var(--color-rose);
  border-color: var(--color-rose);
  color: var(--color-on-rose);
  transform: translateY(-1px);
}

.kb-therapy__final {
  text-align: center;
  margin-top: clamp(40px, 6vw, 56px);
}

.kb-therapy__cta {
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

.kb-therapy__cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}
</style>
