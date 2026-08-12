<template>
  <div class="loading-spinner" role="status" aria-live="polite">
    <div class="spinner-dots" aria-hidden="true">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
    <span v-else class="kb-visually-hidden">Cargando…</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  /* Se usa siempre como contenido único de una página entera mientras se
     esperan los datos de la API. Sin esta altura mínima, el documento pasa
     de "alto" (contenido pre-renderizado que Vue reemplaza al montar) a
     "bajo" (este spinner) y vuelve a crecer al llegar los datos, saltando
     el pie de página dos veces -- una causa real y medible de layout shift
     para usuarios reales, aunque no afecta a los rastreadores que sí ven
     el HTML pre-renderizado. Esto no lo elimina del todo (seguiría
     habiendo un salto al pasar de este alto aproximado al alto real), pero
     reduce bastante la magnitud del salto sin tocar cómo se cargan los
     datos de cada página. */
  min-height: 60vh;
}

.spinner-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-rose);
  animation: bounce 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  40% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.loading-message {
  font-family: var(--font-family-inter);
  font-size: var(--font-size-secondary);
  color: var(--color-secondary);
  margin: 0;
  text-align: center;
}

.kb-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
