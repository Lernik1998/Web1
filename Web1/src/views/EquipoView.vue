<template>
  <section class="kb-team">
    <div class="kb-team__header">
      <h1 class="kb-team__title text-h1">Equipo de psicólogas en Dénia</h1>
      <p class="kb-team__lead text-body">
        Psicólogas colegiadas especializadas en psicología infantil,
        adolescentes, adultos y terapia de pareja, con atención presencial en
        Dénia y también online. Un mismo objetivo: acompañarte con calidez y
        profesionalidad en cada etapa.
      </p>
    </div>

    <LoadingSpinner v-if="loading" message="Cargando equipo..." />

    <div v-else-if="error" class="kb-team__error">
      <p>Error: {{ error }}</p>
      <p class="text-secondary">Verifica que la API esté accesible.</p>
    </div>

    <div v-else class="kb-team__grid">
      <article
        v-for="(member, i) in cards"
        :key="member.slug"
        class="kb-team-card"
        v-animate-on-scroll
        v-spotlight
        :style="{ transitionDelay: `${i * 100}ms` }"
      >
        <router-link :to="`/equipo/${member.slug}`" class="kb-team-card__media">
          <img
            v-if="member.photo && !brokenPhotos.has(member.slug)"
            :src="member.photo.image"
            :alt="member.name"
            class="kb-team-card__image"
            loading="lazy"
            @error="brokenPhotos.add(member.slug)"
          />
          <div v-else class="kb-team-card__placeholder" aria-hidden="true">
            {{ member.initials }}
          </div>
        </router-link>
        <router-link :to="`/equipo/${member.slug}`" class="kb-team-card__name-link">
          <h3 class="kb-team-card__name text-h3">{{ member.name }}</h3>
        </router-link>

        <router-link :to="`/equipo/${member.slug}`" class="kb-team-card__link text-cta" v-ripple>
          Más sobre {{ member.name.split(' ')[0] }}
        </router-link>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchProfesionales, fetchMediaById } from '../services/dataService'
import { getMediaUrl } from '../utils/media'
import { useSeoMeta } from '../composables/useSeoMeta'
import type { ProfesionalPost } from '../types/api'
import LoadingSpinner from '../components/LoadingSpinner.vue'

defineOptions({
  name: 'EquipoView',
})

useSeoMeta(() => ({
  title: 'Equipo de psicólogas en Dénia',
  description:
    'Equipo de psicólogas colegiadas en Dénia: infantil, adolescentes, adultos y terapia de pareja. Atención presencial en Dénia y también online.',
}))

const loading = ref(true)
const error = ref<string | null>(null)
const professionals = ref<ProfesionalPost[]>([])
// `hero_image` es un ID de la biblioteca de medios, no la imagen destacada
// del post (que estas fichas no usan), así que hay que resolverlo aparte.
const photoUrls = ref<Record<number, string>>({})
// Si la URL de una foto llega rota (404, medio borrado en WordPress...), se
// trata igual que si no hubiera foto: cae al placeholder de iniciales en vez
// de mostrar el icono de imagen rota del navegador.
const brokenPhotos = ref<Set<string>>(new Set())

// María B. Kanbouri (directora del centro) va siempre primera; el resto, por
// orden alfabético. WordPress por defecto las devuelve por fecha de creación,
// que no es un orden que tenga sentido de cara al usuario.
const FIRST_SLUG = 'maria-b-kanbouri'

const sortedProfessionals = computed(() =>
  [...professionals.value].sort((a, b) => {
    if (a.slug === FIRST_SLUG) return -1
    if (b.slug === FIRST_SLUG) return 1
    return a.title.rendered.localeCompare(b.title.rendered, 'es')
  }),
)

const cards = computed(() =>
  sortedProfessionals.value.map((post) => {
    const name = post.title.rendered
    // `list_image` es opcional: si no se ha configurado en WordPress, la
    // ficha del listado cae en `hero_image` (la misma foto del perfil).
    const listImageId = post.acf.list_image || post.acf.hero_image
    const apiPhoto = photoUrls.value[listImageId] ?? null
    return {
      slug: post.slug,
      name,
      photo: apiPhoto ? { image: apiPhoto } : null,
      initials: name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
    }
  }),
)

onMounted(async () => {
  try {
    professionals.value = await fetchProfesionales()

    const mediaIds = [
      ...new Set(
        professionals.value.flatMap((post) => [post.acf.hero_image, post.acf.list_image]),
      ),
    ].filter((id): id is number => Boolean(id))
    const mediaResults = await Promise.all(mediaIds.map((id) => fetchMediaById(id)))
    const urlMap: Record<number, string> = {}
    mediaResults.forEach((media, index) => {
      const id = mediaIds[index]
      // Las fichas del listado son pequeñas (~300px): con "medium_large"
      // (768px) sobra calidad de sobra incluso en pantallas retina.
      const url = getMediaUrl(media, 'medium_large')
      if (id && url) urlMap[id] = url
    })
    photoUrls.value = urlMap
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching profesionales:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.kb-team {
  background: var(--color-paper-alt);
  padding: clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px);
}

.kb-team__header {
  max-width: 640px;
  margin: 0 auto 28px;
  text-align: center;
}

.kb-team__title {
  margin-bottom: 10px;
}

.kb-team__lead {
  color: var(--color-ink);
}

.kb-team__error {
  max-width: 640px;
  margin: 0 auto;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-left: 3px solid #d32f2f;
  border-radius: var(--radius-md);
  padding: 24px 28px;
  color: #b23c3c;
  text-align: center;
}

.kb-team__grid {
  max-width: 1500px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
}

.kb-team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--dur-base) var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-team-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-popover);
    border-color: transparent;
  }
}

.kb-team-card.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base),
    box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-team-card.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (hover: hover) and (pointer: fine) {
  .kb-team-card.kb-animate-onscroll.is-visible:hover {
    transform: translateY(-4px);
    transition: transform var(--dur-base) var(--ease-base),
      box-shadow var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
  }
}

.kb-team-card__media {
  display: block;
  width: 100%;
  overflow: hidden;
}

.kb-team-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  object-position: center 20%;
  transform: scale(var(--img-scale, 1));
  transition: transform var(--dur-slow) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-team-card:hover .kb-team-card__image {
    transform: scale(calc(var(--img-scale, 1) * 1.05));
  }
}

.kb-team-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--color-rose-soft-wash);
  color: var(--color-rose-hover);
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 600;
}

.kb-team-card__name-link {
  text-decoration: none;
}

.kb-team-card__name {
  margin: 14px 0 2px;
  transition: color var(--dur-base) var(--ease-base);
  margin-top:20px
}

@media (hover: hover) and (pointer: fine) {
  .kb-team-card__name-link:hover .kb-team-card__name {
    color: var(--color-rose-hover);
  }
}

.kb-team-card__link {
  display: inline-flex;
  align-items: center;
  margin-top:10px;
  margin-bottom: 18px;
  padding: 11px 24px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-team-card__link:hover {
    background: var(--color-rose-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-cta-hover);
  }
}

.kb-team-card__link:active {
  transform: translateY(0) scale(0.97);
  box-shadow: var(--shadow-cta);
}

/* ---------- Responsive ---------- */
@media (max-width: 1080px) {
  .kb-team__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .kb-team__grid {
    grid-template-columns: 1fr;
    max-width: 360px;
  }
}
</style>
