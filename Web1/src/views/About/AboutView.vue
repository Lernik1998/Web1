<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAboutMePage } from '../../services/dataService'
import { parseTeamContent } from '../../utils/teamParser'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

defineOptions({
  name: 'AboutView',
})

const loading = ref(true)
const error = ref<string | null>(null)
const member = ref<ReturnType<typeof parseTeamContent>[number] | null>(null)

onMounted(async () => {
  try {
    const page = await fetchAboutMePage()
    const parsed = page ? parseTeamContent(page.content.rendered) : []
    member.value = parsed[0] ?? null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching about me page:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="kb-about">
    <div class="kb-about__inner">
      <LoadingSpinner v-if="loading" message="Cargando..." />

      <div v-else-if="error" class="kb-about__error">
        <p>Error: {{ error }}</p>
        <p class="text-secondary">Verifica que la API esté accesible.</p>
      </div>

      <template v-else-if="member">
        <div class="kb-about__masthead" v-animate-on-scroll>
          <div v-if="member.photo" class="kb-about__media">
            <img :src="member.photo" :alt="member.name" class="kb-about__image" />
          </div>

          <div class="kb-about__intro">
            <h1 class="kb-about__name text-h1">{{ member.name }}</h1>
            <p v-if="member.role" class="kb-about__role text-secondary">{{ member.role }}</p>

            <div v-if="member.bio.length" class="kb-about__bio">
              <p v-for="(paragraph, index) in member.bio" :key="index" class="text-body">
                {{ paragraph }}
              </p>
            </div>

            <router-link to="/pedir-cita" class="kb-about__cta text-cta">
              Pedir cita
            </router-link>
          </div>
        </div>

        <div class="kb-about__formacion">
          <div v-if="member.formacionAcademica.length" class="kb-about__block" v-animate-on-scroll>
            <h2 class="text-h3">Formación académica</h2>
            <ul class="kb-about__list">
              <li v-for="(item, index) in member.formacionAcademica" :key="index">{{ item }}</li>
            </ul>
          </div>

          <div v-if="member.formacionExtra.length" class="kb-about__block" v-animate-on-scroll>
            <h2 class="text-h3">Formación extracurricular</h2>
            <ul class="kb-about__list">
              <li v-for="(item, index) in member.formacionExtra" :key="index">{{ item }}</li>
            </ul>
          </div>
        </div>
      </template>

      <div v-else class="kb-about__error">
        <p>No se encontró la página "Sobre mí".</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kb-about {
  background: var(--color-paper);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-about__inner {
  max-width: 880px;
  margin: 0 auto;
}

.kb-about__error {
  background: var(--color-paper-alt);
  border: 1px solid var(--color-line);
  border-left: 3px solid #d32f2f;
  border-radius: var(--radius-md);
  padding: 24px 28px;
  text-align: center;
  color: #b23c3c;
}

.kb-about__error .text-secondary {
  margin-top: 6px;
  color: inherit;
}

/* ---------- Cabecera: retrato + presentación, a diferencia del retrato
   pequeño y el texto centrado que usan las fichas de Equipo ---------- */
.kb-about__masthead {
  display: grid;
  grid-template-columns: minmax(0, 300px) 1fr;
  gap: clamp(32px, 5vw, 56px);
  align-items: start;
  margin-bottom: clamp(48px, 7vw, 72px);
}

.kb-about__media {
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
}

.kb-about__image {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: center 18%;
}

.kb-about__name {
  margin-bottom: 6px;
}

.kb-about__role {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 13px;
  margin-bottom: 22px;
}

.kb-about__bio {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 26px;
}

.kb-about__bio p {
  max-width: 60ch;
  line-height: 1.7;
  color: var(--color-ink);
}

.kb-about__cta {
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

.kb-about__cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}

/* ---------- Formación: bloques apilados de ancho completo (no dos
   columnas descuadradas cuando una lista es más larga que la otra) ---------- */
.kb-about__formacion {
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 4vw, 40px);
}

.kb-about__block {
  padding-top: clamp(24px, 3vw, 32px);
  border-top: 1px solid var(--color-line);
}

.kb-about__block h2 {
  margin-bottom: 14px;
  color: var(--color-heading);
}

.kb-about__list {
  list-style: disc;
  padding-left: 1.2em;
  columns: 2;
  column-gap: clamp(24px, 4vw, 40px);
  line-height: 1.6;
  color: var(--color-ink);
}

.kb-about__list li {
  break-inside: avoid;
  margin-bottom: 10px;
}

.kb-about__list li::marker {
  color: var(--color-rose);
}

/* ---------- Animación al entrar en la pantalla ---------- */
.kb-about__masthead.kb-animate-onscroll,
.kb-about__block.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base);
}

.kb-about__masthead.kb-animate-onscroll.is-visible,
.kb-about__block.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .kb-about__masthead {
    grid-template-columns: 1fr;
  }

  .kb-about__media {
    max-width: 260px;
    margin: 0 auto;
  }

  .kb-about__intro {
    text-align: center;
  }

  .kb-about__bio {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .kb-about__list {
    columns: 1;
  }
}
</style>
