import { watchEffect, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'
import { SITE_ORIGIN } from './useSeoMeta'

export interface PersonSchemaInput {
  name: string
  jobTitle?: string
  description?: string
  image?: string
  /** Nº de colegiada/o, si se conoce (credencial verificable real). */
  licenseNumber?: string
  url: string
  /** Perfiles reales de esta persona (p. ej. LinkedIn), no del centro. */
  sameAs?: string[]
}

const SCRIPT_ID = 'kb-person-schema'

/**
 * Datos estructurados Person para la ficha de cada profesional: nombre,
 * cargo, foto y colegiatura. Es justo el tipo de señal de autoridad (quién
 * es, qué le acredita) que tanto Google como los asistentes de IA usan para
 * decidir si citan a alguien como fuente fiable en temas de salud.
 */
export function usePersonSchema(source: MaybeRefOrGetter<PersonSchemaInput | null | undefined>) {
  watchEffect(() => {
    const person = toValue(source)
    const existing = document.getElementById(SCRIPT_ID)

    if (!person) {
      existing?.remove()
      return
    }

    const script = (existing as HTMLScriptElement | null) ?? document.createElement('script')
    script.id = SCRIPT_ID
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      jobTitle: person.jobTitle || 'Psicóloga',
      description: person.description || undefined,
      image: person.image || undefined,
      url: person.url,
      ...(person.licenseNumber ? { identifier: `Colegiada nº ${person.licenseNumber}` } : {}),
      ...(person.sameAs?.length ? { sameAs: person.sameAs } : {}),
      worksFor: {
        '@type': 'MedicalBusiness',
        name: 'Kanbouri Psicología',
        url: SITE_ORIGIN,
      },
    })

    if (!existing) document.head.appendChild(script)
  })

  onUnmounted(() => {
    document.getElementById(SCRIPT_ID)?.remove()
  })
}
