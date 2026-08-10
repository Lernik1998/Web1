import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn<(...args: unknown[]) => Promise<{ data: unknown }>>(),
    post: vi.fn<(...args: unknown[]) => Promise<{ data: unknown }>>(),
  },
}))

import apiClient from '../api'
import {
  fetchPageBySlug,
  fetchPageBySlugProcessed,
  fetchAvisoLegalPage,
  fetchPoliticaPrivacidadPage,
  fetchPoliticaCookiesPage,
  fetchPedirCitaPage,
  fetchHomePage,
  fetchMediaById,
  fetchAboutMePage,
  fetchForPsicologosPage,
  fetchProfesionales,
  fetchProfesionalBySlug,
  fetchTherapieBySlug,
  fetchCookieSetting,
  fetchMapsSetting,
  fetchFooterInformation,
  fetchBlogPosts,
  fetchBlogPostBySlug,
  fetchGoogleReviews,
  subscribeToNewsletter,
} from '../dataService'

const mockedGet = apiClient.get as unknown as ReturnType<typeof vi.fn>
const mockedPost = apiClient.post as unknown as ReturnType<typeof vi.fn>

describe('dataService', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    mockedPost.mockReset()
  })

  describe('fetchPageBySlug', () => {
    it('calls the pages endpoint with the given slug and returns the raw array', async () => {
      const pages = [{ id: 1, slug: 'home' }]
      mockedGet.mockResolvedValueOnce({ data: pages })
      const result = await fetchPageBySlug('home')
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/wp/v2/pages?slug=home')
      expect(result).toEqual(pages)
    })
  })

  describe('fetchPageBySlugProcessed', () => {
    it('returns the first page when the array is non-empty', async () => {
      const page = { id: 5, slug: 'aviso-legal' }
      mockedGet.mockResolvedValueOnce({ data: [page] })
      const result = await fetchPageBySlugProcessed('aviso-legal')
      expect(result).toEqual(page)
    })

    it('returns null when the array is empty', async () => {
      mockedGet.mockResolvedValueOnce({ data: [] })
      const result = await fetchPageBySlugProcessed('aviso-legal')
      expect(result).toBeNull()
    })
  })

  const slugFetchers: Array<[string, (...args: never[]) => Promise<unknown>, string]> = [
    ['fetchAvisoLegalPage', fetchAvisoLegalPage as never, 'aviso-legal'],
    ['fetchPoliticaPrivacidadPage', fetchPoliticaPrivacidadPage as never, 'politica-privacidad'],
    ['fetchPoliticaCookiesPage', fetchPoliticaCookiesPage as never, 'politica-de-cookies-ue'],
    ['fetchPedirCitaPage', fetchPedirCitaPage as never, 'form-appointment'],
    ['fetchHomePage', fetchHomePage as never, 'home'],
    ['fetchAboutMePage', fetchAboutMePage as never, 'about-me'],
    ['fetchForPsicologosPage', fetchForPsicologosPage as never, 'for-psychologists'],
  ]

  it.each(slugFetchers)('%s requests the correct slug and unwraps the first page', async (_name, fn, slug) => {
    const page = { id: 1, slug }
    mockedGet.mockResolvedValueOnce({ data: [page] })
    const result = await fn()
    expect(mockedGet).toHaveBeenCalledWith(`/wp-json/wp/v2/pages?slug=${slug}`)
    expect(result).toEqual(page)
  })

  it.each(slugFetchers)('%s returns null when WordPress has no matching page', async (_name, fn) => {
    mockedGet.mockResolvedValueOnce({ data: [] })
    const result = await fn()
    expect(result).toBeNull()
  })

  describe('fetchMediaById', () => {
    it('returns null for a falsy id without calling the API', async () => {
      const result = await fetchMediaById(0)
      expect(result).toBeNull()
      expect(mockedGet).not.toHaveBeenCalled()
    })

    it('fetches the media by id and returns it', async () => {
      const media = { id: 42, source_url: '/uploads/42.jpg' }
      mockedGet.mockResolvedValueOnce({ data: media })
      const result = await fetchMediaById(42)
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/wp/v2/media/42')
      expect(result).toEqual(media)
    })

    it('returns null (not throwing) when the API call rejects', async () => {
      mockedGet.mockRejectedValueOnce(new Error('network error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = await fetchMediaById(99)
      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })
  })

  describe('fetchBlogPosts', () => {
    it('requests posts ordered by date desc with default page/perPage params (3 per page)', async () => {
      const posts = [{ id: 1 }]
      mockedGet.mockResolvedValueOnce({ data: posts, headers: { 'x-wp-totalpages': '4' } })
      const result = await fetchBlogPosts()
      expect(mockedGet).toHaveBeenCalledWith(
        '/wp-json/wp/v2/posts?_embed&orderby=date&order=desc&per_page=3&page=1',
      )
      expect(result).toEqual({ posts, totalPages: 4 })
    })

    it('requests posts with custom page/perPage params', async () => {
      mockedGet.mockResolvedValueOnce({ data: [], headers: {} })
      await fetchBlogPosts(3, 5)
      expect(mockedGet).toHaveBeenCalledWith(
        '/wp-json/wp/v2/posts?_embed&orderby=date&order=desc&per_page=5&page=3',
      )
    })

    it('falls back to 1 total page when the header is missing', async () => {
      mockedGet.mockResolvedValueOnce({ data: [], headers: {} })
      const result = await fetchBlogPosts()
      expect(result.totalPages).toBe(1)
    })
  })

  describe('fetchBlogPostBySlug', () => {
    it('returns the first matching post', async () => {
      const post = { id: 7, slug: 'mi-post' }
      mockedGet.mockResolvedValueOnce({ data: [post] })
      const result = await fetchBlogPostBySlug('mi-post')
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/wp/v2/posts?slug=mi-post&_embed')
      expect(result).toEqual(post)
    })

    it('returns null when no post matches the slug', async () => {
      mockedGet.mockResolvedValueOnce({ data: [] })
      const result = await fetchBlogPostBySlug('no-existe')
      expect(result).toBeNull()
    })
  })

  describe('fetchProfesionales', () => {
    it('requests all professionals with embedded featured media', async () => {
      const posts = [{ id: 1, slug: 'ana-garcia' }]
      mockedGet.mockResolvedValueOnce({ data: posts })
      const result = await fetchProfesionales()
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/wp/v2/profesional?_embed&per_page=100')
      expect(result).toEqual(posts)
    })
  })

  describe('fetchProfesionalBySlug', () => {
    it('requests the professional by slug and returns the first match', async () => {
      const post = { id: 1, slug: 'ana-garcia' }
      mockedGet.mockResolvedValueOnce({ data: [post] })
      const result = await fetchProfesionalBySlug('ana-garcia')
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/wp/v2/profesional?slug=ana-garcia&_embed')
      expect(result).toEqual(post)
    })

    it('returns null when no professional matches the slug', async () => {
      mockedGet.mockResolvedValueOnce({ data: [] })
      const result = await fetchProfesionalBySlug('no-existe')
      expect(result).toBeNull()
    })
  })

  describe('fetchTherapieBySlug', () => {
    it('requests the therapy by slug and returns the first match', async () => {
      const post = { id: 1, slug: 'ansiedad' }
      mockedGet.mockResolvedValueOnce({ data: [post] })
      const result = await fetchTherapieBySlug('ansiedad')
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/wp/v2/therapie?slug=ansiedad&_embed')
      expect(result).toEqual(post)
    })

    it('returns null when no therapy matches the slug', async () => {
      mockedGet.mockResolvedValueOnce({ data: [] })
      const result = await fetchTherapieBySlug('no-existe')
      expect(result).toBeNull()
    })
  })

  describe('fetchCookieSetting', () => {
    it('requests the cookie-kanbouri setting and returns the first match', async () => {
      const post = { id: 955, slug: 'cookie-kanbouri' }
      mockedGet.mockResolvedValueOnce({ data: [post] })
      const result = await fetchCookieSetting()
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/wp/v2/setting?slug=cookie-kanbouri')
      expect(result).toEqual(post)
    })

    it('returns null when there is no setting configured', async () => {
      mockedGet.mockResolvedValueOnce({ data: [] })
      const result = await fetchCookieSetting()
      expect(result).toBeNull()
    })
  })

  describe('fetchMapsSetting', () => {
    it('requests the maps setting and returns the first match', async () => {
      const post = { id: 959, slug: 'maps' }
      mockedGet.mockResolvedValueOnce({ data: [post] })
      const result = await fetchMapsSetting()
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/wp/v2/setting?slug=maps')
      expect(result).toEqual(post)
    })

    it('returns null when there is no setting configured', async () => {
      mockedGet.mockResolvedValueOnce({ data: [] })
      const result = await fetchMapsSetting()
      expect(result).toBeNull()
    })
  })

  describe('fetchFooterInformation', () => {
    it('requests the footer-information post and returns the first match', async () => {
      const post = { id: 1062, slug: 'footer' }
      mockedGet.mockResolvedValueOnce({ data: [post] })
      const result = await fetchFooterInformation()
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/wp/v2/footer-information?slug=footer')
      expect(result).toEqual(post)
    })

    it('returns null when there is no footer-information post configured', async () => {
      mockedGet.mockResolvedValueOnce({ data: [] })
      const result = await fetchFooterInformation()
      expect(result).toBeNull()
    })
  })

  describe('fetchGoogleReviews', () => {
    it('fetches reviews from the kanbouri reviews endpoint', async () => {
      const reviews = [{ id: '1', user: 'Ana' }]
      mockedGet.mockResolvedValueOnce({ data: reviews })
      const result = await fetchGoogleReviews()
      expect(mockedGet).toHaveBeenCalledWith('/wp-json/kanbouri/v1/reviews')
      expect(result).toEqual(reviews)
    })
  })

  describe('subscribeToNewsletter', () => {
    it('posts the name, email and recaptcha token to the appointment endpoint', async () => {
      mockedPost.mockResolvedValueOnce({ data: {} })
      await subscribeToNewsletter('David', 'david@example.com', 'a-token')
      expect(mockedPost).toHaveBeenCalledWith('/wp-json/kanbouri/v1/appointment', {
        name: 'David',
        email: 'david@example.com',
        recaptcha_token: 'a-token',
      })
    })
  })
})
