export interface TeamPhoto {
  image: string
  imageScale?: number
  imagePosition?: string
}

/**
 * La página "team" de WordPress no trae fotos por profesional, así que las
 * gestionamos aquí en local, indexadas por el slug (derivado del nombre) que
 * genera `parseTeamContent`. Cuando WordPress tenga una profesional sin foto
 * asignada todavía, se usa un avatar con iniciales en su lugar.
 */
const PHOTOS: Record<string, TeamPhoto> = {
  'maria-b-kanbouri': { image: '/images/maria-kanbouri.jpg' },
  'beatriz-donet': { image: '/images/beatirz-donet.jpg' },
  'ester-pinedo-gil': {
    image: '/images/ester-pinedo.png',
    imageScale: 1.4,
    imagePosition: 'center 30%',
  },
}

export function getTeamPhoto(slug: string): TeamPhoto | null {
  // Quitamos el sufijo de deduplicación ("-2", "-3"...) para que, mientras
  // WordPress tenga un nombre repetido de relleno, siga encontrando la
  // misma foto que el original.
  const baseSlug = slug.replace(/-\d+$/, '')
  return PHOTOS[baseSlug] ?? null
}
