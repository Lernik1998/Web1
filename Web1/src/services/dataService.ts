import apiClient from './api'
import type {
  WordPressPage,
  WordPressPost,
  WordPressMedia,
  WordPressHomePage,
  GoogleReview,
  PageSlug,
} from '../types/api'

// Fetch WordPress page by slug
export const fetchPageBySlug = async (slug: PageSlug): Promise<WordPressPage[]> => {
  const response = await apiClient.get<WordPressPage[]>(`/wp-json/wp/v2/pages?slug=${slug}`)
  return response.data
}

// El endpoint personalizado `/wp-json/processed-content/v1/page/{slug}` no
// existe en el WordPress real (siempre devuelve 404), así que se consulta
// directamente la API estándar de páginas.
export const fetchPageBySlugProcessed = async (slug: PageSlug): Promise<WordPressPage | null> => {
  const pages = await fetchPageBySlug(slug)
  return pages.length > 0 ? (pages[0] ?? null) : null
}

export const fetchAvisoLegalPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('aviso-legal')
}

export const fetchPoliticaPrivacidadPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('politica-privacidad')
}

export const fetchPoliticaCookiesPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('politica-de-cookies-ue')
}

export const fetchPedirCitaPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('pedircita')
}

export const fetchHomePage = async (): Promise<WordPressHomePage | null> => {
  return fetchPageBySlugProcessed('home') as Promise<WordPressHomePage | null>
}

// Imagen de la biblioteca de medios por ID (usado para resolver hero_image,
// therapy_X_image, etc. de los campos ACF, que solo dan el ID numérico).
export const fetchMediaById = async (id: number): Promise<WordPressMedia | null> => {
  if (!id) return null
  try {
    const response = await apiClient.get<WordPressMedia>(`/wp-json/wp/v2/media/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching media ${id}:`, error)
    return null
  }
}

export const fetchAboutMePage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('about-me')
}

export const fetchForPsicologosPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('for-psychologists')
}

export const fetchTeamPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('team')
}

// Artículos del blog (WordPress posts, no páginas). `_embed` trae la imagen
// destacada y las categorías ya resueltas para no hacer peticiones extra.
export const fetchBlogPosts = async (page = 1, perPage = 9): Promise<WordPressPost[]> => {
  const response = await apiClient.get<WordPressPost[]>(
    `/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`,
  )
  return response.data
}

export const fetchBlogPostBySlug = async (slug: string): Promise<WordPressPost | null> => {
  const response = await apiClient.get<WordPressPost[]>(`/wp-json/wp/v2/posts?slug=${slug}&_embed`)
  return response.data.length > 0 ? (response.data[0] ?? null) : null
}

// Reseñas de Google (endpoint propio del WordPress, no la API estándar).
export const fetchGoogleReviews = async (): Promise<GoogleReview[]> => {
  const response = await apiClient.get<GoogleReview[]>('/wp-json/kanbouri/v1/reviews')
  return response.data
}
