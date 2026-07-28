<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchForPsicologosPage } from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner.vue'

defineOptions({
  name: 'ParaPsicologosView',
})

const pageLoading = ref(true)

const areas = [
  { label: 'Ansiedad', href: '/terapia-online/adultos/ansiedad' },
  { label: 'Depresión y estado de ánimo', href: '/terapia-online/adultos/depresion' },
  { label: 'Autoestima y desarrollo personal', href: '/terapia-online/adultos/autoestima' },
  { label: 'Duelo y pérdidas', href: '/terapia-online/adultos/duelo' },
  { label: 'Psicología infantil', href: '/terapia-online/infantil' },
  { label: 'Psicología para adolescentes', href: '/terapia-online/adolescentes' },
  { label: 'Padres y familia', href: '/terapia-online/padres-familia' },
]

const steps = [
  {
    title: 'Contacta',
    description: 'Escríbenos desde el formulario de cita o escribe a',
    email: 'gabinete@kanbouripsicologia.com',
  },
  {
    title: 'Cuéntanos tu caso',
    description:
      'Antes de la sesión, comparte brevemente el caso o los casos que te gustaría revisar.',
  },
  {
    title: 'Sesión online',
    description:
      'Nos conectamos por videollamada en el horario que hayamos acordado juntas.',
  },
]

onMounted(async () => {
  try {
    await fetchForPsicologosPage()
  } catch (err) {
    console.error('Error fetching para psicólogos:', err)
  } finally {
    pageLoading.value = false
  }
})
</script>

<template>
  <section class="kb-supervision">
    <LoadingSpinner v-if="pageLoading" message="Cargando..." />

    <template v-else>
      <div class="kb-supervision__header">
        <h1 class="kb-supervision__title text-h1">Supervisión clínica para profesionales</h1>
        <p class="kb-supervision__lead text-body">
          Un espacio de supervisión online para revisar casos, afinar
          herramientas de intervención y cuidar también de quien acompaña a
          otros en su proceso terapéutico.
        </p>
        <router-link
          :to="{ path: '/pedir-cita', query: { servicio: 'profesionales' } }"
          class="kb-supervision__cta text-cta"
        >
          Reservar supervisión
        </router-link>
      </div>

      <div class="kb-supervision__inner">
        <blockquote class="kb-supervision__quote text-quote">
          La supervisión enriquece la práctica profesional y, a la vez,
          sostiene y protege a quien acompaña a otras personas.
        </blockquote>

        <div class="kb-supervision__card">
          <div class="kb-supervision__block">
            <h2 class="text-h2">Teoría y práctica, de la mano</h2>
            <p class="text-body">
              Cada sesión combina marco teórico y trabajo práctico: revisamos
              el caso, ponemos en común herramientas de intervención y
              dejamos también espacio para el autocuidado del profesional,
              una parte del trabajo que a menudo queda en segundo plano.
            </p>
          </div>

          <div class="kb-supervision__block">
            <h2 class="text-h2">Supervisión individual</h2>
            <p class="text-body">
              Sesión online de una hora, pensada para revisar uno o dos casos
              en profundidad: técnicas, herramientas concretas y también
              cómo te está afectando a ti el acompañamiento.
            </p>
          </div>

          <div class="kb-supervision__block">
            <h2 class="text-h2">Áreas que trabajamos</h2>
            <div class="kb-pill-group">
              <router-link
                v-for="area in areas"
                :key="area.href"
                :to="area.href"
                class="kb-pill kb-pill--link"
              >
                {{ area.label }}
              </router-link>
            </div>
          </div>

          <div class="kb-supervision__block">
            <h2 class="text-h2">Cómo funciona</h2>
            <ol class="kb-steps">
              <li v-for="(step, index) in steps" :key="step.title" class="kb-steps__item">
                <span class="kb-steps__number">{{ index + 1 }}</span>
                <p class="kb-steps__title">{{ step.title }}</p>
                <p class="kb-steps__desc text-secondary">
                  {{ step.description }}
                  <a v-if="step.email" :href="`mailto:${step.email}`" class="kb-steps__email">{{
                    step.email
                  }}</a>
                </p>
              </li>
            </ol>
          </div>
        </div>

        <div class="kb-supervision__final">
          <h2 class="text-h2">¿Empezamos?</h2>
          <p class="text-body">Escríbenos y buscamos juntas el mejor momento.</p>
          <router-link
          :to="{ path: '/pedir-cita', query: { servicio: 'profesionales' } }"
          class="kb-supervision__cta text-cta"
        >
            Reservar supervisión
          </router-link>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.kb-supervision {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-supervision__header {
  max-width: 640px;
  margin: 0 auto 48px;
  text-align: center;
}

.kb-supervision__title {
  margin-bottom: 14px;
}

.kb-supervision__lead {
  color: var(--color-ink);
  margin-bottom: 28px;
}

.kb-supervision__cta {
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

.kb-supervision__cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-supervision__inner {
  max-width: 760px;
  margin: 0 auto;
}

.kb-supervision__quote {
  text-align: center;
  padding: 0 clamp(8px, 4vw, 40px);
  margin: 0 0 clamp(40px, 6vw, 56px);
}

.kb-supervision__card {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  padding: clamp(28px, 5vw, 48px);
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 4vw, 40px);
}

.kb-supervision__block {
  text-align: center;
}

.kb-supervision__block h2 {
  margin-bottom: 12px;
}

.kb-supervision__block p {
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
}

.kb-pill--link {
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base),
    border-color var(--dur-base) var(--ease-base), color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base);
}

.kb-pill--link:hover {
  background: var(--color-rose);
  border-color: var(--color-rose);
  color: var(--color-on-rose);
  transform: translateY(-1px);
}

.kb-steps {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.kb-steps__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.kb-steps__number {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-rose);
  color: var(--color-on-rose);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.kb-steps__title {
  font-weight: 600;
  color: var(--color-heading);
}

.kb-steps__desc {
  line-height: 1.55;
}

.kb-steps__email {
  color: var(--color-rose-hover);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color var(--dur-base) var(--ease-base);
}

.kb-steps__email:hover {
  color: var(--color-rose);
}

.kb-supervision__final {
  text-align: center;
  margin-top: clamp(40px, 6vw, 56px);
}

.kb-supervision__final h2 {
  margin-bottom: 10px;
}

.kb-supervision__final p {
  color: var(--color-ink);
  margin-bottom: 22px;
}
</style>
