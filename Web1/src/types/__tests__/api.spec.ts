import { describe, it, expect } from 'vitest'
import { PAGE_SLUGS } from '../api'

describe('PAGE_SLUGS', () => {
  it('exposes the exact slug strings the rest of the app depends on', () => {
    expect(PAGE_SLUGS).toEqual({
      HOME: 'home',
      ABOUT_ME: 'about-me',
      FOR_PSICOLOGOS: 'for-psychologists',
      PEDIR_CITA: 'form-appointment',
      AVISO_LEGAL: 'aviso-legal',
      POLITICA_PRIVACIDAD: 'politica-privacidad',
      POLITICA_COOKIES: 'politica-de-cookies-ue',
    })
  })
})
