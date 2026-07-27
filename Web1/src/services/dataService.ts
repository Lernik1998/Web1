import apiClient from './api'
import type { WordPressPage, PageSlug, PAGE_SLUGS } from '../types/api'

// Fetch WordPress page by slug
export const fetchPageBySlug = async (slug: PageSlug): Promise<WordPressPage[]> => {
  const response = await apiClient.get<WordPressPage[]>(`/wp-json/wp/v2/pages?slug=${slug}`)
  return response.data
}

// Fetch WordPress page by slug with processed content (shortcodes rendered)
export const fetchPageBySlugProcessed = async (slug: PageSlug): Promise<WordPressPage | null> => {
  try {
    const response = await apiClient.get<WordPressPage>(
      `/wp-json/processed-content/v1/page/${slug}`,
    )
    return response.data
  } catch (error) {
    console.error('Error fetching processed content, falling back to standard API:', error)
    // Fallback to standard API if processed endpoint is not available
    const pages = await fetchPageBySlug(slug)
    return pages.length > 0 ? (pages[0] ?? null) : null
  }
}

// Fetch page by slug and return first result (or null if not found)
export const fetchPageBySlugSingle = async (slug: PageSlug): Promise<WordPressPage | null> => {
  const pages = await fetchPageBySlug(slug)
  return pages.length > 0 ? (pages[0] ?? null) : null
}

// Specific page fetch functions (using processed content endpoint)
export const fetchInicioPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('inicio')
}

export const fetchContactoPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('contacto')
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

export const fetchSobreNosotrasPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('sobre-nosotras')
}

export const fetchQuienesSomosPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('quienes-somos')
}

export const fetchNuestraFilosofiaPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('nuestra-filosofia')
}

export const fetchTerapiaOnlinePage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('terapia-online')
}

export const fetchComoFuncionaPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('como-funciona')
}

export const fetchServiciosPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('servicios')
}

export const fetchPedirCitaPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('pedircita')
}

// New page fetch functions for updated slugs
export const fetchHomePage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('home')
}

export const fetchAboutMePage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('about-me')
}

export const fetchTeamPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('team')
}

export const fetchOnlineTherapyPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('onlinetherpy')
}

export const fetchInfantilPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('infantil')
}

export const fetchAdolescentesPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('adolescentes')
}

export const fetchAdultosPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('adultos')
}

export const fetchAnsiedadPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('ansiedad')
}

export const fetchDepresionPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('depresion')
}

export const fetchAutoestimaPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('autoestima')
}

export const fetchDueloPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('duelo')
}

export const fetchPadresPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('padres')
}

export const fetchForPsicologosPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('forpsicologs')
}

export const fetchBlogPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugProcessed('blog')
}

// Generic GET request for other WordPress endpoints
export const getData = async <T>(endpoint: string): Promise<T> => {
  const response = await apiClient.get<T>(endpoint)
  return response.data
}

// Generic POST request
export const postData = async <T>(endpoint: string, data: unknown): Promise<T> => {
  const response = await apiClient.post<T>(endpoint, data)
  return response.data
}
