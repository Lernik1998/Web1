import { describe, it, expect } from 'vitest'
import router from '../index'

describe('router', () => {
  it('resolves the home route', () => {
    const resolved = router.resolve('/')
    expect(resolved.name).toBe('home')
  })

  it('resolves the pedir-cita route', () => {
    const resolved = router.resolve('/pedir-cita')
    expect(resolved.name).toBe('pedir-cita')
  })

  it('resolves a nested infantil therapy route', () => {
    const resolved = router.resolve('/terapias/infantil')
    expect(resolved.name).toBe('infantil')
  })

  it('resolves a deeply nested adultos/ansiedad therapy route', () => {
    const resolved = router.resolve('/terapias/adultos/ansiedad')
    expect(resolved.name).toBe('ansiedad')
  })

  it('redirects /terapias to /terapias/infantil', () => {
    const resolved = router.resolve('/terapias')
    expect(resolved.redirectedFrom).toBeUndefined()
    // A route with a `redirect` option resolves its matched record's redirect target.
    expect(resolved.matched[0]?.redirect).toBe('/terapias/infantil')
  })

  it('resolves a team-member route with a slug param', () => {
    const resolved = router.resolve('/equipo/maria-b-kanbouri')
    expect(resolved.name).toBe('team-member')
    expect(resolved.params.slug).toBe('maria-b-kanbouri')
  })

  it('resolves a blog-post route with a slug param', () => {
    const resolved = router.resolve('/blog/mi-articulo')
    expect(resolved.name).toBe('blog-post')
    expect(resolved.params.slug).toBe('mi-articulo')
  })

  it('falls back to the catch-all not-found route for unknown paths', () => {
    const resolved = router.resolve('/esta-ruta-no-existe/foo/bar')
    expect(resolved.name).toBe('not-found')
  })

  it('resolves all the other static top-level routes', () => {
    expect(router.resolve('/sobre-mi').name).toBe('sobre-mi')
    expect(router.resolve('/equipo').name).toBe('equipo')
    expect(router.resolve('/para-psicologos').name).toBe('para-psicologos')
    expect(router.resolve('/blog').name).toBe('blog')
    expect(router.resolve('/politica-privacidad').name).toBe('politica-privacidad')
    expect(router.resolve('/aviso-legal').name).toBe('aviso-legal')
    expect(router.resolve('/politica-cookies').name).toBe('politica-cookies')
  })

  describe('scrollBehavior', () => {
    const scrollBehavior = router.options.scrollBehavior!

    it('restores the saved scroll position when navigating back/forward', () => {
      const saved = { left: 0, top: 400 }
      const result = scrollBehavior(
        router.resolve('/') as never,
        router.resolve('/') as never,
        saved,
      )
      expect(result).toBe(saved)
    })

    it('smooth-scrolls to the hash target when the destination has one', () => {
      const to = router.resolve('/#contacto')
      const result = scrollBehavior(to as never, router.resolve('/') as never, null)
      expect(result).toEqual({ el: '#contacto', behavior: 'smooth' })
    })

    it('scrolls to the top for a plain navigation with no saved position or hash', () => {
      const result = scrollBehavior(
        router.resolve('/equipo') as never,
        router.resolve('/') as never,
        null,
      )
      expect(result).toEqual({ top: 0 })
    })
  })
})
