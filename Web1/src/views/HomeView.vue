<template>
  <div>
    <LoadingSpinner v-if="loading" message="Cargando..." />

    <div v-else-if="error" class="state-box error">
      <p>Error: {{ error }}</p>
      <p>Verifica que la API https://kanbouripsicologia.com esté accesible</p>
    </div>

    <template v-else-if="heroProps">
      <Hero v-bind="heroProps" />
      <TherapyCards :cards="therapyCards" />
      <Collaborations />
      <GoogleReviews />
    </template>

    <div v-else class="state-box no-data">
      <p>No se encontró la página con slug 'home'</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchHomePage, fetchMediaById, fetchTherapieBySlug } from '../services/dataService'
import { getMediaUrl } from '../utils/media'
import { useSeoMeta, seoMetaFromYoast } from '../composables/useSeoMeta'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Hero from '../components/Hero.vue'
import TherapyCards from '../components/TherapyCards.vue'
import GoogleReviews from '../components/GoogleReviews.vue'
import Collaborations from '../components/Collaborations.vue'
import type { WordPressHomePage } from '../types/api'

defineOptions({
  name: 'InicioView',
})

const therapyHrefs = [
  '/terapias/infantil',
  '/terapias/adolescentes',
  '/terapias/adultos',
  '/terapias/padres-familia',
]

type TherapyCardData = {
  title: string
  description: string
  imageUrl: string
  buttonText: string
  href: string
  imagePosition?: string
}

// Terapias específicas dentro de "Psicólogo para adultos" (custom post type
// "therapie" en WordPress, no las páginas ACF de home): se muestran además
// de las 4 tarjetas principales, no en su lugar, para que el carrusel
// enlace directamente a cada página concreta.
//
// "Duelo y pérdidas" usa un `imagePosition` propio porque su foto en
// WordPress es vertical, con el punto de interés (las manos entrelazadas)
// en la parte baja: con el recorte por defecto ("center 20%", pensado para
// fotos horizontales) las manos quedaban fuera del encuadre.
const ADULT_SUB_THERAPIES: Array<{ slug: string; href: string; imagePosition?: string }> = [
  { slug: 'ansiedad', href: '/terapias/adultos/ansiedad' },
  { slug: 'depresion-y-estado-de-animo', href: '/terapias/adultos/depresion' },
  { slug: 'autoestima-y-desarrollo-personal', href: '/terapias/adultos/autoestima' },
  { slug: 'duelo-y-perdidas', href: '/terapias/adultos/duelo', imagePosition: 'center 85%' },
]

const pageData = ref<WordPressHomePage | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const mediaUrls = ref<Record<number, string>>({})
const adultSubTherapyCards = ref<TherapyCardData[]>([])

// Título/descripción de Yoast SEO (ya escritos a mano en WordPress, campo
// "yoast_head_json" de la página "home"): se usan tal cual, en vez de
// construir un título propio en el código, para que el equipo del centro
// pueda cambiarlos desde WordPress sin tocar nada aquí. Distinto del
// titular del Hero, que es para la persona que ya está en la página.
useSeoMeta(() => seoMetaFromYoast(pageData.value?.yoast_head_json))

const heroProps = computed(() => {
  const acf = pageData.value?.acf
  if (!acf) return null
  return {
    title: acf.hero_title,
    description: acf.hero_description,
    buttonText: acf.hero_button_text,
    imageUrl: mediaUrls.value[acf.hero_image] ?? '',
  }
})

const therapyCards = computed(() => {
  const acf = pageData.value?.acf
  if (!acf) return []

  const titles = [acf.therapy_1_title, acf.therapy_2_title_, acf.therapy_3_title, acf.therapy_4_title]
  const descriptions = [
    acf.therapy_1_description,
    acf.therapy_2_description,
    acf.therapy_3_description,
    acf.therapy_4_description,
  ]
  const buttonTexts = [
    acf.therapy_1_button_text,
    acf.therapy_2_button_text,
    acf.therapy_3_button_text,
    acf.therapy_4_button_text,
  ]
  const images = [acf.therapy_1_image, acf.therapy_2_image, acf.therapy_3_image, acf.therapy_4_image]

  const mainCards = titles.map((title, index) => ({
    title,
    description: descriptions[index] ?? '',
    buttonText: buttonTexts[index] ?? 'Me interesa',
    imageUrl: mediaUrls.value[images[index] ?? 0] ?? '',
    href: therapyHrefs[index] ?? '/',
  }))

  return [...mainCards, ...adultSubTherapyCards.value]
})

onMounted(async () => {
  try {
    const [response, subTherapies] = await Promise.all([
      fetchHomePage(),
      Promise.all(ADULT_SUB_THERAPIES.map((entry) => fetchTherapieBySlug(entry.slug))),
    ])
    pageData.value = response

    const acf = response?.acf
    const mediaIds = new Set<number>()
    if (acf) {
      ;[
        acf.hero_image,
        acf.therapy_1_image,
        acf.therapy_2_image,
        acf.therapy_3_image,
        acf.therapy_4_image,
      ]
        .filter(Boolean)
        .forEach((id) => mediaIds.add(id))
    }
    subTherapies.forEach((therapy) => {
      if (therapy?.acf.therapy_image) mediaIds.add(therapy.acf.therapy_image)
    })

    const idList = [...mediaIds]
    const mediaResults = await Promise.all(idList.map((id) => fetchMediaById(id)))
    const urlMap: Record<number, string> = {}
    mediaResults.forEach((media, index) => {
      const id = idList[index]
      const url = getMediaUrl(media)
      if (id && url) urlMap[id] = url
    })
    mediaUrls.value = urlMap

    adultSubTherapyCards.value = subTherapies
      .map((therapy, index): TherapyCardData | null => {
        const subAcf = therapy?.acf
        if (!subAcf) return null
        return {
          title: subAcf.therapy_name || therapy.title.rendered,
          // `card_description` es opcional: si en WordPress se deja vacío,
          // la tarjeta usa el mismo texto que la página propia de la
          // terapia (`therapy_description`) como respaldo.
          description: subAcf.card_description?.trim() || subAcf.therapy_description || '',
          imageUrl: urlMap[subAcf.therapy_image] ?? '',
          buttonText: 'Me interesa',
          href: ADULT_SUB_THERAPIES[index]!.href,
          imagePosition: ADULT_SUB_THERAPIES[index]!.imagePosition,
        }
      })
      .filter((card): card is TherapyCardData => card !== null)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching WordPress page:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.state-box {
  max-width: 640px;
  margin: 3rem auto;
  padding: 1.5rem;
  text-align: center;
  border-radius: var(--radius-md);
}

.error {
  color: #b23c3c;
  background-color: #ffebee;
}

.no-data {
  color: #666;
  font-style: italic;
}
</style>
