<script setup lang="ts">
defineOptions({
  name: 'DepresionView',
})

const cuandoAyuda = [
  'Tristeza persistente o falta de energía',
  'Pérdida de interés en cosas que antes disfrutabas',
  'Cambios en el sueño o el apetito',
  'Sensación de desmotivación o de «no avanzar»',
  'Dificultad para ver salida a la situación actual',
]
</script>

<template>
  <section class="kb-therapy">
    <div class="kb-therapy__header">
      <h1 class="kb-therapy__title text-h1">Depresión y estado de ánimo</h1>
      <p class="kb-therapy__lead text-body">
        Un espacio para acompañarte cuando el ánimo baja y cuesta encontrar
        la energía o la motivación del día a día.
      </p>
    </div>

    <div class="kb-therapy__card">
      <div class="kb-therapy__block">
        <h2 class="text-h2">¿Cuándo puede ayudar la terapia?</h2>
        <ul class="kb-therapy__list">
          <li v-for="item in cuandoAyuda" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="kb-therapy__block">
        <h2 class="text-h2">Cómo trabajamos</h2>
        <p class="text-body">
          Acompañamos el proceso desde la escucha y sin juicio, ayudándote a
          entender qué está pasando y a recuperar, poco a poco, herramientas
          y espacios que te den bienestar.
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

.kb-therapy__list {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  max-width: 46ch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.kb-therapy__list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
  text-align: left;
}

.kb-therapy__list li::before {
  content: '';
  flex-shrink: 0;
  margin-top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-rose);
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
