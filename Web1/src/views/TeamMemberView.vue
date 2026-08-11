<template>
  <section class="kb-profile">
    <div class="kb-profile__inner">
      <Breadcrumbs v-if="breadcrumbItems" :items="breadcrumbItems" />
      <router-link v-else to="/equipo" class="kb-profile__back text-secondary">
        ← Volver al equipo
      </router-link>

      <LoadingSpinner v-if="loading" message="Cargando..." />

      <div v-else-if="error" class="kb-profile__error">
        <p>Error: {{ error }}</p>
        <p class="text-secondary">Verifica que la API esté accesible.</p>
      </div>

      <article v-else-if="member">
        <div class="kb-profile__masthead" v-animate-on-scroll>
          <div class="kb-profile__media">
            <img
              v-if="photo && !photoLoadFailed"
              :src="photo.image"
              :alt="member.name"
              class="kb-profile__image"
              @error="photoLoadFailed = true"
            />
            <div v-else class="kb-profile__placeholder" aria-hidden="true">{{ initials }}</div>
          </div>

          <div class="kb-profile__intro">
            <h1 class="kb-profile__name text-h1">{{ member.name }}</h1>
            <p v-if="member.role" class="kb-profile__role text-secondary">{{ member.role }}</p>
            <p v-if="member.licenseNumber" class="kb-profile__license text-secondary">
              Nº de colegiada: {{ member.licenseNumber }}
            </p>

            <div v-if="member.bio.length" class="kb-profile__bio">
              <p v-for="(paragraph, index) in member.bio" :key="index" class="text-body">
                {{ paragraph }}
              </p>
            </div>

            <router-link to="/pedir-cita" class="kb-profile__cta kb-glare text-cta">
              Pedir cita
            </router-link>
          </div>
        </div>

        <div class="kb-profile__formacion">
          <div v-if="member.formacionAcademica.length" class="kb-profile__block" v-animate-on-scroll>
            <h2 class="text-h3">Formación académica</h2>
            <ul
              class="kb-profile__list"
              :class="{ 'kb-profile__list--single': member.formacionAcademica.length < 2 }"
            >
              <li v-for="(item, index) in member.formacionAcademica" :key="index">{{ item }}</li>
            </ul>
          </div>

          <div v-if="member.formacionExtra.length" class="kb-profile__block" v-animate-on-scroll>
            <h2 class="text-h3">Formación extracurricular</h2>
            <ul
              class="kb-profile__list"
              :class="{ 'kb-profile__list--single': member.formacionExtra.length < 2 }"
            >
              <li v-for="(item, index) in member.formacionExtra" :key="index">{{ item }}</li>
            </ul>
          </div>
        </div>
      </article>

      <div v-else class="kb-profile__error">
        <p>No se encontró a esta profesional.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchProfesionalBySlug, fetchMediaById } from '../services/dataService'
import { parseProfesionalAcf } from '../utils/profesionalAcf'
import { getMediaUrl } from '../utils/media'
import { useSeoMeta, seoMetaFromYoast, SITE_ORIGIN } from '../composables/useSeoMeta'
import { usePersonSchema } from '../composables/usePersonSchema'
import { useBreadcrumbSchema } from '../composables/useBreadcrumbSchema'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import type { YoastHeadJson } from '../types/api'

defineOptions({
  name: 'TeamMemberView',
})

const props = defineProps<{
  slug: string
}>()

const loading = ref(true)
const error = ref<string | null>(null)
const name = ref('')
const parsed = ref<ReturnType<typeof parseProfesionalAcf> | null>(null)
const apiPhoto = ref<string | null>(null)
// Si la URL de la foto llega rota (404, medio borrado en WordPress...), se
// trata igual que si no hubiera foto: cae al placeholder de iniciales en vez
// de mostrar el icono de imagen rota del navegador.
const photoLoadFailed = ref(false)
const yoast = ref<YoastHeadJson | null>(null)

const member = computed(() => (parsed.value ? { name: name.value, ...parsed.value } : null))
// La foto viene de la propia API (`hero_image`, un ID de la biblioteca de
// medios); si no hay ninguna asignada, se muestra el placeholder de iniciales.
const photo = computed(() => (apiPhoto.value ? { image: apiPhoto.value } : null))
const initials = computed(() =>
  member.value
    ? member.value.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : '',
)

// Título/descripción de Yoast SEO, ya escritos a mano en WordPress para
// esta ficha: se usan tal cual, no se construyen aquí.
useSeoMeta(
  computed(() => {
    const meta = seoMetaFromYoast(yoast.value)
    return meta ? { ...meta, image: apiPhoto.value ?? undefined, type: 'profile' } : null
  }),
)

usePersonSchema(
  computed(() =>
    member.value
      ? {
          name: member.value.name,
          jobTitle: member.value.role || undefined,
          description: member.value.bio[0],
          image: apiPhoto.value ?? undefined,
          licenseNumber: member.value.licenseNumber || undefined,
          url: `${SITE_ORIGIN}/equipo/${props.slug}`,
        }
      : null,
  ),
)

const breadcrumbItems = computed(() =>
  member.value
    ? [
        { name: 'Inicio', path: '/' },
        { name: 'Equipo', path: '/equipo' },
        { name: member.value.name, path: `/equipo/${props.slug}` },
      ]
    : null,
)

useBreadcrumbSchema(breadcrumbItems)

onMounted(async () => {
  try {
    const post = await fetchProfesionalBySlug(props.slug)
    if (post) {
      name.value = post.title.rendered
      parsed.value = parseProfesionalAcf(post.acf)
      yoast.value = post.yoast_head_json ?? null
      if (post.acf.hero_image) {
        const media = await fetchMediaById(post.acf.hero_image)
        apiPhoto.value = getMediaUrl(media) ?? null
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching profesional:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.kb-profile {
  background: var(--color-paper);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-profile__inner {
  max-width: 880px;
  margin: 0 auto;
}

.kb-profile__back {
  display: inline-block;
  margin-bottom: 28px;
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-profile__back:hover {
    color: var(--color-rose-hover);
  }
}

.kb-profile__error {
  background: var(--color-paper-alt);
  border: 1px solid var(--color-line);
  border-left: 3px solid #d32f2f;
  border-radius: var(--radius-md);
  padding: 24px 28px;
  text-align: center;
  color: #b23c3c;
}

.kb-profile__error .text-secondary {
  margin-top: 6px;
  color: inherit;
}

/* ---------- Cabecera: retrato + presentación ---------- */
.kb-profile__masthead {
  display: grid;
  grid-template-columns: minmax(0, 300px) 1fr;
  gap: clamp(32px, 5vw, 56px);
  align-items: start;
  margin-bottom: clamp(48px, 7vw, 72px);
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
}

.kb-profile__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 4 / 5;
  background: var(--color-rose-soft-wash);
  color: var(--color-rose-hover);
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
}

.kb-profile__name {
  margin-bottom: 6px;
}

.kb-profile__role {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 13px;
  margin-bottom: 4px;
}

.kb-profile__license {
  margin-bottom: 22px;
}

.kb-profile__bio {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 26px;
}

.kb-profile__bio p {
  max-width: 60ch;
  line-height: 1.7;
  color: var(--color-ink);
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

@media (hover: hover) and (pointer: fine) {
  .kb-profile__cta:hover {
    background: var(--color-rose-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-cta-hover);
  }
}

/* ---------- Formación: bloques apilados de ancho completo ---------- */
.kb-profile__formacion {
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 4vw, 40px);
}

.kb-profile__block {
  padding-top: clamp(24px, 3vw, 32px);
  border-top: 1px solid var(--color-line);
}

.kb-profile__block h2 {
  margin-bottom: 14px;
  color: var(--color-heading);
}

.kb-profile__list {
  list-style: disc;
  padding-left: 1.2em;
  columns: 2;
  column-gap: clamp(24px, 4vw, 40px);
  line-height: 1.6;
  color: var(--color-ink);
}

/* Con un solo punto no tiene sentido repartir en 2 columnas: se queda a
   medio ancho y descuadrado frente al resto de bloques. */
.kb-profile__list--single {
  columns: 1;
}

.kb-profile__list li {
  break-inside: avoid;
  margin-bottom: 10px;
  /* Si el contenido trae una cadena larga sin espacios (p. ej. un texto de
     relleno aún sin rellenar en WordPress), que se parta dentro de su
     columna en vez de desbordarla y descuadrar el resto del bloque. */
  overflow-wrap: anywhere;
}

.kb-profile__list li::marker {
  color: var(--color-rose);
}

/* ---------- Animación al entrar en la pantalla ---------- */
.kb-profile__masthead.kb-animate-onscroll,
.kb-profile__block.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base);
}

.kb-profile__masthead.kb-animate-onscroll.is-visible,
.kb-profile__block.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .kb-profile__masthead {
    grid-template-columns: 1fr;
  }

  .kb-profile__media {
    max-width: 260px;
    margin: 0 auto;
  }

  .kb-profile__intro {
    text-align: center;
  }

  .kb-profile__bio {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .kb-profile__list {
    columns: 1;
  }
}
</style>
