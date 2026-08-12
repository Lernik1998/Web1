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
  media: Pick<WordPressMedia, 'source_url' | 'media_details'> | null | undefined,
  size: 'medium' | 'medium_large' | 'large' = 'large',
): string | undefined {
  if (!media) return undefined
  return media.media_details?.sizes?.[size]?.source_url ?? media.source_url
}

/**
 * `srcset` para imágenes que se muestran a un ancho muy distinto según el
 * tamaño de pantalla (p. ej. el Hero: ~280px en móvil, ~460px en
 * escritorio): con un único tamaño fijo, o sirve de más en móvil o de menos
 * en escritorio. Con `srcset`, el propio navegador elige qué variante
 * descargar según el ancho real y la densidad de píxeles de cada visita.
 * Solo incluye los tamaños que WordPress haya generado de verdad para ese
 * adjunto (algunos, si el original es pequeño, no llegan a existir).
 */
export function getMediaSrcSet(
  media: Pick<WordPressMedia, 'source_url' | 'media_details'> | null | undefined,
): string | undefined {
  const sizes = media?.media_details?.sizes
  if (!sizes) return undefined
  const entries = (['medium_large', 'large'] as const)
    .map((size) => sizes[size])
    .filter((entry): entry is { source_url: string; width: number; height: number } => !!entry)
  if (!entries.length) return undefined
  return entries.map((entry) => `${entry.source_url} ${entry.width}w`).join(', ')
}
