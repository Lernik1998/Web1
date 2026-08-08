import { watchEffect, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'

export interface FaqItem {
  question: string
  answer: string
}

const SCRIPT_ID = 'kb-faq-schema'

/**
 * Inyecta datos estructurados FAQPage (Schema.org) para las preguntas
 * frecuentes de la página actual. Sirve para dos públicos a la vez:
 * - Buscadores tradicionales: habilita el desplegable de "la gente también
 *   pregunta" en los resultados de Google.
 * - Motores de respuesta con IA (ChatGPT, Perplexity, Google AI Overviews):
 *   son precisamente el tipo de contenido pregunta/respuesta ya extraído y
 *   verificado que estos sistemas citan con más facilidad.
 *
 * Un único <script> reutilizado por id (no uno por página, para no ir
 * acumulando etiquetas huérfanas al navegar), que se retira por completo
 * si la página no tiene FAQs o al salir de ella.
 */
export function useFaqSchema(source: MaybeRefOrGetter<FaqItem[] | null | undefined>) {
  watchEffect(() => {
    const faqs = toValue(source)
    const existing = document.getElementById(SCRIPT_ID)

    if (!faqs || faqs.length === 0) {
      existing?.remove()
      return
    }

    const script =
      (existing as HTMLScriptElement | null) ?? document.createElement('script')
    script.id = SCRIPT_ID
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    })

    if (!existing) document.head.appendChild(script)
  })

  onUnmounted(() => {
    document.getElementById(SCRIPT_ID)?.remove()
  })
}
