import type { WordPressMedia } from '../types/api'

/**
 * Los campos de imagen de ACF (hero_image, therapy_image, list_image...)
 * solo guardan el ID del adjunto, así que `fetchMediaById` siempre devuelve
 * el archivo ORIGINAL subido a WordPress (a menudo 2000-2500px de ancho),
 * aunque en la web se muestre dentro de una tarjeta de 300-500px. Esto
 * multiplica por 5-10 el peso de cada imagen sin ninguna ganancia visual.
 *
 * WordPress genera automáticamente variantes más pequeñas (`medium`,
 * `medium_large`, `large`...) en `media_details.sizes`; aquí se elige la
 * variante indicada y, si no existe (adjunto sin ese tamaño, p. ej. un PDF
 * o una imagen ya pequeña), se cae de vuelta al archivo original.
 */
export function getMediaUrl(
  media: WordPressMedia | null | undefined,
  size: 'medium' | 'medium_large' | 'large' = 'large',
): string | undefined {
  if (!media) return undefined
  return media.media_details?.sizes?.[size]?.source_url ?? media.source_url
}
