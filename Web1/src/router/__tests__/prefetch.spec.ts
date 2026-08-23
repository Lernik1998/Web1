import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  fetchTherapieBySlugMock,
  fetchProfesionalesMock,
  fetchProfesionalBySlugMock,
  fetchMediaByIdMock,
  fetchBlogPostsMock,
  fetchBlogPostBySlugMock,
  fetchHomePageMock,
  fetchAboutMePageMock,
  fetchForPsicologosPageMock,
  fetchPedirCitaPageMock,
  fetchAvisoLegalPageMock,
  fetchPoliticaPrivacidadPageMock,
  fetchPoliticaCookiesPageMock,
} = vi.hoisted(() => ({
  fetchTherapieBySlugMock: vi.fn().mockResolvedValue(null),
  fetchProfesionalesMock: vi.fn().mockResolvedValue([]),
  fetchProfesionalBySlugMock: vi.fn().mockResolvedValue(null),
  fetchMediaByIdMock: vi.fn().mockResolvedValue(null),
  fetchBlogPostsMock: vi.fn().mockResolvedValue({ posts: [], totalPages: 1 }),
  fetchBlogPostBySlugMock: vi.fn().mockResolvedValue(null),
  fetchHomePageMock: vi.fn().mockResolvedValue(null),
  fetchAboutMePageMock: vi.fn().mockResolvedValue(null),
  fetchForPsicologosPageMock: vi.fn().mockResolvedValue(null),
  fetchPedirCitaPageMock: vi.fn().mockResolvedValue(null),
  fetchAvisoLegalPageMock: vi.fn().mockResolvedValue(null),
  fetchPoliticaPrivacidadPageMock: vi.fn().mockResolvedValue(null),
  fetchPoliticaCookiesPageMock: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../services/dataService', () => ({
  fetchTherapieBySlug: fetchTherapieBySlugMock,
  fetchProfesionales: fetchProfesionalesMock,
  fetchProfesionalBySlug: fetchProfesionalBySlugMock,
  fetchMediaById: fetchMediaByIdMock,
  fetchBlogPosts: fetchBlogPostsMock,
  fetchBlogPostBySlug: fetchBlogPostBySlugMock,
  fetchHomePage: fetchHomePageMock,
  fetchAboutMePage: fetchAboutMePageMock,
  fetchForPsicologosPage: fetchForPsicologosPageMock,
  fetchPedirCitaPage: fetchPedirCitaPageMock,
  fetchAvisoLegalPage: fetchAvisoLegalPageMock,
  fetchPoliticaPrivacidadPage: fetchPoliticaPrivacidadPageMock,
  fetchPoliticaCookiesPage: fetchPoliticaCookiesPageMock,
}))

import { prefetchRoute } from '../prefetch'

describe('prefetchRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing for a route name it does not recognize', () => {
    prefetchRoute('some-unknown-route', {})
    expect(fetchHomePageMock).not.toHaveBeenCalled()
  })

  it('does nothing when name is not a string (e.g. undefined, from an unresolved route)', () => {
    prefetchRoute(undefined, {})
    expect(fetchHomePageMock).not.toHaveBeenCalled()
  })

  it('prefetches the home page', () => {
    prefetchRoute('home', {})
    expect(fetchHomePageMock).toHaveBeenCalledTimes(1)
  })

  it('prefetches a team member by slug from route params', () => {
    prefetchRoute('team-member', { slug: 'beatriz-donet' })
    expect(fetchProfesionalBySlugMock).toHaveBeenCalledWith('beatriz-donet')
  })

  it('does nothing for team-member when the slug param is missing', () => {
    prefetchRoute('team-member', {})
    expect(fetchProfesionalBySlugMock).not.toHaveBeenCalled()
  })

  // La ficha real (TeamMemberView.vue) pide, tras cargar a la persona, su
  // foto (`hero_image`) -- sin encadenar también ese segundo fetch aquí, el
  // prefetch dejaba la petición de la foto sin resolver, y la ficha seguía
  // mostrando "Cargando" mientras llegaba (bug real, comprobado en
  // navegador antes de este cambio).
  it('also prefetches the team member photo once their profile resolves', async () => {
    fetchProfesionalBySlugMock.mockResolvedValueOnce({ acf: { hero_image: 42 } })
    prefetchRoute('team-member', { slug: 'beatriz-donet' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(fetchMediaByIdMock).toHaveBeenCalledWith(42)
  })

  it('does not prefetch a photo when the team member has none', async () => {
    fetchProfesionalBySlugMock.mockResolvedValueOnce({ acf: { hero_image: 0 } })
    prefetchRoute('team-member', { slug: 'beatriz-donet' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(fetchMediaByIdMock).not.toHaveBeenCalled()
  })

  // El listado (EquipoView.vue) pide, tras el listado, la foto de cada
  // persona (`hero_image`/`list_image`) -- mismo motivo que arriba.
  it('also prefetches every team member photo (hero_image and list_image) for the equipo listing', async () => {
    fetchProfesionalesMock.mockResolvedValueOnce([
      { acf: { hero_image: 1, list_image: 2 } },
      { acf: { hero_image: 1, list_image: 3 } },
    ])
    prefetchRoute('equipo', {})
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(fetchMediaByIdMock).toHaveBeenCalledWith(1)
    expect(fetchMediaByIdMock).toHaveBeenCalledWith(2)
    expect(fetchMediaByIdMock).toHaveBeenCalledWith(3)
    // El id 1 se repite en las dos personas: no hace falta pedirlo dos veces.
    expect(fetchMediaByIdMock).toHaveBeenCalledTimes(3)
  })

  it('prefetches a blog post by slug', () => {
    prefetchRoute('blog-post', { slug: 'un-articulo' })
    expect(fetchBlogPostBySlugMock).toHaveBeenCalledWith('un-articulo')
  })

  it('prefetches blog listing page 1 by default', () => {
    prefetchRoute('blog', {})
    expect(fetchBlogPostsMock).toHaveBeenCalledWith(1)
  })

  it('prefetches a specific blog pagination page from the route param', () => {
    prefetchRoute('blog-pagina', { page: '3' })
    expect(fetchBlogPostsMock).toHaveBeenCalledWith(3)
  })

  it('falls back to page 1 for blog-pagina when the param is not a valid number', () => {
    prefetchRoute('blog-pagina', { page: 'not-a-number' })
    expect(fetchBlogPostsMock).toHaveBeenCalledWith(1)
  })

  it('prefetches each adult sub-therapy with its WordPress slug', () => {
    prefetchRoute('ansiedad', {})
    expect(fetchTherapieBySlugMock).toHaveBeenCalledWith('ansiedad')

    prefetchRoute('depresion', {})
    expect(fetchTherapieBySlugMock).toHaveBeenCalledWith('depresion-y-estado-de-animo')
  })

  it('prefetches the top-level therapy hubs with their fixed WordPress slugs', () => {
    prefetchRoute('infantil', {})
    expect(fetchTherapieBySlugMock).toHaveBeenCalledWith('psicologia-infantil')

    prefetchRoute('adolescentes', {})
    expect(fetchTherapieBySlugMock).toHaveBeenCalledWith('psicologia-para-adolescentes')

    prefetchRoute('padres-familia', {})
    expect(fetchTherapieBySlugMock).toHaveBeenCalledWith('psicologia-para-padres-y-familia')
  })

  it('never lets a rejected prefetch escape as an unhandled rejection', async () => {
    fetchHomePageMock.mockRejectedValueOnce(new Error('network down'))
    expect(() => prefetchRoute('home', {})).not.toThrow()
    // Deja que la promesa rechazada (y su `.catch` interno) se resuelva
    // antes de terminar el test, para que Vitest no la reporte como no
    // gestionada.
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
})
