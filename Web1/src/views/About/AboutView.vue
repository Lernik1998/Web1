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
          <div v-if="member.photo" class="kb-about__frame">
            <div class="kb-about__media-decor" aria-hidden="true"></div>
            <div class="kb-about__media" v-spotlight>
              <img :src="member.photo" :alt="member.name" class="kb-about__image" />
            </div>
          </div>

          <div class="kb-about__intro">
            <p v-if="member.role" class="kb-about__role">{{ member.role }}</p>
            <h1 class="kb-about__name text-h1">{{ member.name }}</h1>

            <p v-if="member.bio[0]" class="kb-about__lead">{{ member.bio[0] }}</p>

            <router-link to="/pedir-cita" class="kb-about__cta kb-glare text-cta" v-ripple>
              Pedir cita
            </router-link>
          </div>
        </div>

        <div v-if="member.bio.length > 1" class="kb-about__bio" v-animate-on-scroll>
          <span class="kb-about__ornament" aria-hidden="true"></span>
          <p v-for="(paragraph, index) in member.bio.slice(1)" :key="index">
            {{ paragraph }}
          </p>
        </div>

        <div class="kb-about__formacion">
          <div v-if="member.formacionAcademica.length" class="kb-about__block" v-animate-on-scroll>
            <span class="kb-about__ornament" aria-hidden="true"></span>
            <h2 class="text-h3">Formación académica</h2>
            <ul class="kb-about__list">
              <li v-for="(item, index) in member.formacionAcademica" :key="index">{{ item }}</li>
            </ul>
          </div>

          <div v-if="member.formacionExtra.length" class="kb-about__block" v-animate-on-scroll>
            <span class="kb-about__ornament" aria-hidden="true"></span>
            <h2 class="text-h3">Formación extracurricular</h2>
            <ul class="kb-about__list">
              <li v-for="(item, index) in member.formacionExtra" :key="index">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div class="kb-about__closing" v-animate-on-scroll>
          <h2 class="kb-about__closing-title">¿Empezamos a trabajar juntas?</h2>
          <p class="kb-about__closing-text">
            Escríbeme y reservemos tu primera sesión, presencial en Dénia u online.
          </p>
          <router-link to="/pedir-cita" class="kb-about__cta kb-about__cta--light kb-glare text-cta" v-ripple>
            Pedir cita
          </router-link>
        </div>
      </template>

      <div v-else class="kb-about__error">
        <p>No se encontró la página "Sobre mí".</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchAboutMePage } from '../../services/dataService'
import { parseTeamContent } from '../../utils/teamParser'
import { useSeoMeta, truncateForMeta } from '../../composables/useSeoMeta'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

defineOptions({
  name: 'AboutView',
})

const loading = ref(true)
const error = ref<string | null>(null)
const member = ref<ReturnType<typeof parseTeamContent>[number] | null>(null)

useSeoMeta(
  computed(() =>
    member.value
      ? {
          title: `${member.value.name} — Sobre mí`,
          description: member.value.bio[0]
            ? truncateForMeta(member.value.bio[0])
            : `Conoce a ${member.value.name}, psicóloga en Dénia.`,
          image: member.value.photo ?? undefined,
          type: 'profile',
        }
      : null,
  ),
)

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

<style scoped>
.kb-about {
  position: relative;
  background: var(--color-paper);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
  overflow: hidden;
}

.kb-about::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 96% -4%, var(--color-paper-alt) 0%, transparent 50%),
    radial-gradient(circle at -8% 40%, var(--color-rose-soft-wash) 0%, transparent 45%);
  opacity: 0.8;
  pointer-events: none;
  z-index: 0;
}

.kb-about__inner {
  position: relative;
  z-index: 1;
  max-width: 1040px;
  margin: 0 auto;
}

.kb-about__error {
  max-width: 640px;
  margin: 0 auto;
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

/* ---------- Cabecera: retrato de tamaño moderado (mismo lenguaje que el
   Hero de Inicio: sombra desplazada en degradado rosa detrás de la foto)
   junto a la presentación. ---------- */
.kb-about__masthead {
  display: grid;
  grid-template-columns: minmax(0, 340px) 1fr;
  gap: clamp(32px, 5vw, 64px);
  align-items: center;
  margin-bottom: clamp(56px, 8vw, 80px);
}

/* El retrato va enmarcado como una pieza expuesta: un passe-partout de
   papel alrededor de la foto, con la sombra desplazada en degradado rosa
   detrás (mismo lenguaje que el Hero de Inicio) a modo de repisa. */
.kb-about__frame {
  position: relative;
}

.kb-about__media-decor {
  position: absolute;
  inset: 0;
  transform: translate(12px, 12px);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-rose-soft) 0%, var(--color-secondary) 100%);
  opacity: 0.45;
  z-index: 0;
}

.kb-about__media {
  position: relative;
  z-index: 1;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: calc(var(--radius-lg) + 8px);
  box-shadow: var(--shadow-popover);
  padding: 10px;
}

.kb-about__image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: center 18%;
  border-radius: var(--radius-md);
  transform: scale(1);
  transition: transform 700ms var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-about__media:hover .kb-about__image {
    transform: scale(1.025);
  }
}

.kb-about__role {
  font-family: var(--font-body);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 13px;
  color: var(--color-rose-hover);
  margin-bottom: 10px;
}

.kb-about__name {
  margin-bottom: 20px;
}

.kb-about__lead {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(18px, 2vw, 21px);
  line-height: 1.55;
  color: var(--color-heading);
  max-width: 44ch;
  margin-bottom: 28px;
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

@media (hover: hover) and (pointer: fine) {
  .kb-about__cta:hover {
    background: var(--color-rose-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-cta-hover);
  }
}

.kb-about__cta:active {
  transform: translateY(0) scale(0.97);
  box-shadow: var(--shadow-cta);
}

/* ---------- Biografía: columna de lectura cómoda, con letra capitular en
   el primer párrafo. ---------- */
.kb-about__bio {
  max-width: 68ch;
  margin: 0 auto clamp(56px, 8vw, 80px);
  padding-top: clamp(28px, 4vw, 36px);
}

/* Ornamento de separación: un motivo propio (línea + rombo) en vez de una
   simple raya, repetido a lo largo de la página como firma visual. */
.kb-about__ornament {
  display: block;
  position: relative;
  height: 1px;
  background: var(--color-line);
  margin-bottom: clamp(28px, 4vw, 36px);
}

.kb-about__ornament::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 7px;
  height: 7px;
  background: var(--color-rose);
  border-radius: 1.5px;
  transform: translateY(-50%) rotate(45deg);
}

.kb-about__bio p {
  font-size: 17px;
  line-height: 1.8;
  color: var(--color-ink);
  margin-bottom: 1.3em;
}

.kb-about__bio p:last-child {
  margin-bottom: 0;
}

.kb-about__bio p:first-child::first-letter {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 3.2em;
  line-height: 0.75;
  float: left;
  padding: 4px 8px 0 0;
  color: var(--color-rose-hover);
}

/* ---------- Formación: bloques apilados de ancho completo (nunca lado a
   lado), cada uno con su propia altura natural. ---------- */
.kb-about__formacion {
  display: flex;
  flex-direction: column;
  gap: clamp(32px, 4vw, 44px);
  margin-bottom: clamp(56px, 8vw, 80px);
}

.kb-about__block h2 {
  margin-bottom: 16px;
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
  padding-left: 2px;
}

.kb-about__list li::marker {
  color: var(--color-rose);
}

/* ---------- Cierre: banda destacada que invita a pedir cita ---------- */
.kb-about__closing {
  text-align: center;
  background: linear-gradient(135deg, var(--color-rose) 0%, var(--color-rose-hover) 100%);
  border-radius: var(--radius-lg);
  padding: clamp(40px, 6vw, 64px) clamp(24px, 5vw, 48px);
}

.kb-about__closing-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(24px, 3vw, 32px);
  color: var(--color-on-rose);
  margin-bottom: 12px;
}

.kb-about__closing-text {
  color: var(--color-on-rose);
  opacity: 0.92;
  max-width: 46ch;
  margin: 0 auto 26px;
}

.kb-about__cta--light {
  background: var(--color-on-rose);
  color: var(--color-rose-hover);
  box-shadow: none;
}

@media (hover: hover) and (pointer: fine) {
  .kb-about__cta--light:hover {
    background: var(--color-paper-alt);
    color: var(--color-rose-hover);
  }
}

/* ---------- Animación al entrar en la pantalla ---------- */
.kb-about__masthead.kb-animate-onscroll,
.kb-about__bio.kb-animate-onscroll,
.kb-about__block.kb-animate-onscroll,
.kb-about__closing.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base);
}

.kb-about__masthead.kb-animate-onscroll.is-visible,
.kb-about__bio.kb-animate-onscroll.is-visible,
.kb-about__block.kb-animate-onscroll.is-visible,
.kb-about__closing.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .kb-about__masthead {
    grid-template-columns: 1fr;
  }

  .kb-about__frame {
    max-width: 280px;
    margin: 0 auto;
  }

  .kb-about__intro {
    text-align: center;
  }

  .kb-about__lead {
    margin-left: auto;
    margin-right: auto;
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
