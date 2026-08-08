<template>
  <section class="kb-supervision">
    <LoadingSpinner v-if="loading" message="Cargando..." />

    <div v-else-if="error" class="kb-supervision__error">
      <p>Error: {{ error }}</p>
      <p class="text-secondary">Verifica que la API esté accesible.</p>
    </div>

    <template v-else-if="pageData">
      <div class="kb-supervision__header">
        <h1 class="kb-supervision__title text-h1">{{ title }}</h1>
        <p class="kb-supervision__lead text-body">{{ lead }}</p>
        <router-link
          :to="{ path: '/pedir-cita', query: { servicio: 'profesionales' } }"
          class="kb-supervision__cta text-cta"
        >
          {{ buttonText }}
        </router-link>
      </div>

      <div class="kb-supervision__inner">
        <blockquote v-if="quote" class="kb-supervision__quote text-quote">
          {{ quote }}
        </blockquote>

        <div class="kb-supervision__card">
          <div
            v-for="block in textBlocks"
            :key="block.title"
            class="kb-supervision__block"
            v-animate-on-scroll
          >
            <h2 class="text-h2">{{ block.title }}</h2>
            <p class="text-body">{{ block.description }}</p>
          </div>

          <div v-if="areas.length" class="kb-supervision__block" v-animate-on-scroll>
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

          <div v-if="steps.length" class="kb-supervision__block" v-animate-on-scroll>
            <h2 class="text-h2">Cómo funciona</h2>
            <ol class="kb-steps">
              <li v-for="(step, index) in steps" :key="step.title" class="kb-steps__item">
                <span class="kb-steps__number">{{ index + 1 }}</span>
                <p class="kb-steps__title">{{ step.title }}</p>
                <p class="kb-steps__desc text-secondary" v-html="step.description"></p>
              </li>
            </ol>
          </div>

          <div class="kb-supervision__block" v-animate-on-scroll>
            <NewsletterSignup />
          </div>
        </div>

        <div v-if="finalHeading" class="kb-supervision__final">
          <h2 class="text-h2">{{ finalHeading }}</h2>
          <p class="text-body">{{ finalText }}</p>
          <router-link
            :to="{ path: '/pedir-cita', query: { servicio: 'profesionales' } }"
            class="kb-supervision__cta text-cta"
          >
            {{ buttonText }}
          </router-link>
        </div>
      </div>
    </template>

    <div v-else class="kb-supervision__error">
      <p>No se encontró la página.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchForPsicologosPage } from '../services/dataService'
import { processWordPressContent } from '../utils/contentProcessor'
import { useSeoMeta } from '../composables/useSeoMeta'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import NewsletterSignup from '../components/NewsletterSignup.vue'
import type { WordPressPage } from '../types/api'

defineOptions({
  name: 'ParaPsicologosView',
})

const pageData = ref<WordPressPage | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

useSeoMeta(() => ({
  title: 'Supervisión para psicólogos',
  description:
    'Espacio de supervisión clínica para psicólogos y profesionales de la salud mental, con Kanbouri Psicología en Dénia.',
}))

/**
 * Ruta interna de cada área listada en "Áreas que trabajamos". El texto de
 * cada área viene de WordPress, pero a qué página de Terapia Online enlaza
 * es una decisión de navegación de esta SPA, así que se resuelve por texto.
 */
const AREA_ROUTES: Record<string, string> = {
  ansiedad: '/terapias/adultos/ansiedad',
  'depresión y estado de ánimo': '/terapias/adultos/depresion',
  'autoestima y desarrollo personal': '/terapias/adultos/autoestima',
  'duelo y pérdidas': '/terapias/adultos/duelo',
  'psicología infantil': '/terapias/infantil',
  'psicología para adolescentes': '/terapias/adolescentes',
  'padres y familia': '/terapias/padres-familia',
}

interface TextBlock {
  title: string
  description: string
}

interface Step {
  title: string
  description: string
}

const lead = ref('')
const quote = ref('')
const buttonText = ref('Reservar supervisión')
const textBlocks = ref<TextBlock[]>([])
const areas = ref<{ label: string; href: string }[]>([])
const steps = ref<Step[]>([])
const finalHeading = ref('')
const finalText = ref('')

function splitByBr(html: string): string[] {
  return html
    .split(/<br\s*\/?>/i)
    .map((part) => part.trim())
    .filter(Boolean)
}

function parseContent(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const children = Array.from(doc.body.children)

  const firstButtons = children.find((el) => el.classList.contains('wp-block-buttons'))
  const leadParagraph = children.find(
    (el) => el.tagName === 'P' && (!firstButtons || children.indexOf(el) < children.indexOf(firstButtons)),
  )
  lead.value = leadParagraph?.textContent?.trim() ?? ''

  const firstButtonLink = doc.querySelector('.wp-block-button__link')
  if (firstButtonLink?.textContent?.trim()) {
    buttonText.value = firstButtonLink.textContent.trim()
  }

  quote.value = doc.querySelector('blockquote')?.textContent?.trim() ?? ''

  const h3s = Array.from(doc.querySelectorAll('h3'))
  const blocks: TextBlock[] = []
  for (const h3 of h3s) {
    const title = h3.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const next = h3.nextElementSibling
    if (!next) continue

    if (next.tagName === 'UL') {
      areas.value = Array.from(next.querySelectorAll('li')).map((li) => {
        const label = li.textContent?.replace(/\s+/g, ' ').trim() ?? ''
        return { label, href: AREA_ROUTES[label.toLowerCase()] ?? '/terapias' }
      })
    } else if (next.tagName === 'P') {
      blocks.push({ title, description: next.textContent?.trim() ?? '' })
    }
  }
  textBlocks.value = blocks

  const h4 = doc.querySelector('h4')
  if (h4) {
    const paragraphs: HTMLElement[] = []
    let node = h4.nextElementSibling
    while (node && node.tagName === 'P') {
      paragraphs.push(node as HTMLElement)
      node = node.nextElementSibling
    }

    const finalParagraph = paragraphs.pop()
    const lines = paragraphs.flatMap((p) => splitByBr(p.innerHTML))

    const parsedSteps: Step[] = []
    for (let i = 0; i < lines.length; i += 2) {
      parsedSteps.push({
        title: lines[i] ?? '',
        description: processWordPressContent(lines[i + 1] ?? ''),
      })
    }
    steps.value = parsedSteps

    if (finalParagraph) {
      const finalLines = splitByBr(finalParagraph.innerHTML)
      finalHeading.value = finalLines[0] ?? ''
      finalText.value = finalLines[1] ?? ''
    }
  }
}

onMounted(async () => {
  try {
    pageData.value = await fetchForPsicologosPage()
    if (pageData.value) parseContent(pageData.value.content.rendered)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching para psicólogos:', err)
  } finally {
    loading.value = false
  }
})

const title = computed(() => pageData.value?.title.rendered ?? '')
</script>

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

.kb-supervision__block.kb-animate-onscroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 550ms var(--ease-base), transform 550ms var(--ease-base);
}

.kb-supervision__block.kb-animate-onscroll.is-visible {
  opacity: 1;
  transform: translateY(0);
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

.kb-steps__desc :deep(a) {
  color: var(--color-rose-hover);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color var(--dur-base) var(--ease-base);
}

.kb-steps__desc :deep(a:hover) {
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

.kb-supervision__error {
  max-width: 640px;
  margin: 0 auto;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-left: 3px solid #d32f2f;
  border-radius: var(--radius-md);
  padding: 24px 28px;
  color: #b23c3c;
}
</style>
