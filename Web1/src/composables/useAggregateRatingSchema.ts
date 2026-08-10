import { watchEffect, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'

export interface AggregateRatingInput {
  ratingValue: number
  reviewCount: number
}

const SCRIPT_ID = 'kb-business-schema'

function readSchema(script: HTMLScriptElement): Record<string, unknown> | null {
  try {
    return JSON.parse(script.textContent ?? '{}')
  } catch {
    return null
  }
}

/**
 * Añade (o retira) la propiedad "aggregateRating" del bloque de datos
 * estructurados del negocio (id="kb-business-schema", en index.html) a
 * partir de las reseñas reales de Google que trae GoogleReviews.vue.
 *
 * Se completa así, en tiempo de ejecución, en vez de dejarlo fijo en el
 * HTML estático: la valoración real cambia con cada reseña nueva, y un
 * número inventado o desactualizado en los datos estructurados incumple
 * las directrices de Google sobre contenido enriquecido (y, si Google lo
 * detecta, puede penalizar el resto de la marca "MedicalBusiness").
 *
 * Solo debe aparecer mientras la página muestra de verdad esas reseñas
 * (hoy, solo la portada): se retira al desmontar para no describir en
 * datos estructurados un contenido que ya no está en la página.
 */
export function useAggregateRatingSchema(
  source: MaybeRefOrGetter<AggregateRatingInput | null | undefined>,
) {
  watchEffect(() => {
    const data = toValue(source)
    const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!script) return

    const parsed = readSchema(script)
    if (!parsed) return

    if (data && data.reviewCount > 0) {
      parsed.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: data.ratingValue,
        reviewCount: data.reviewCount,
      }
    } else {
      delete parsed.aggregateRating
    }

    script.textContent = JSON.stringify(parsed)
  })

  onUnmounted(() => {
    const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!script) return
    const parsed = readSchema(script)
    if (!parsed) return
    delete parsed.aggregateRating
    script.textContent = JSON.stringify(parsed)
  })
}
