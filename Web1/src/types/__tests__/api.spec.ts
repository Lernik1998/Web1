import { describe, it, expect } from 'vitest'
import { PAGE_SLUGS } from '../api'

describe('PAGE_SLUGS', () => {
  it('exposes the exact slug strings the rest of the app depends on', () => {
    expect(PAGE_SLUGS).toEqual({
      HOME: 'home',
      ABOUT_ME: 'about-me',
      FOR_PSICOLOGOS: 'for-psychologists',
      TEAM: 'team',
      CHILD_PSYCHOLOGY: 'child-psychology',
      ADOLESCENT_PSYCHOLOGY: 'psychology-for-adolescents',
      ADULT_ANXIETY: 'adult-anxiety',
      ADULT_DEPRESSION: 'adult-depression',
      ADULT_SELF_ESTEEM: 'adult-self-esteem',
      ADULT_GRIEF: 'adult-grief',
      PSYCHOLOGY_PARENTS: 'psychology-parents',
      PEDIR_CITA: 'form-appointment',
      AVISO_LEGAL: 'aviso-legal',
      POLITICA_PRIVACIDAD: 'politica-privacidad',
      POLITICA_COOKIES: 'politica-de-cookies-ue',
    })
  })
})
