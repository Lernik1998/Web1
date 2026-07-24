import apiClient from './api'
import type { WordPressPage, PageSlug, PAGE_SLUGS } from '../types/api'

// Fetch WordPress page by slug
export const fetchPageBySlug = async (slug: PageSlug): Promise<WordPressPage[]> => {
  const response = await apiClient.get<WordPressPage[]>(`/wp-json/wp/v2/pages?slug=${slug}`)
  return response.data
}

// Fetch page by slug and return first result (or null if not found)
export const fetchPageBySlugSingle = async (slug: PageSlug): Promise<WordPressPage | null> => {
  const pages = await fetchPageBySlug(slug)
  return pages.length > 0 ? (pages[0] ?? null) : null
}

// Specific page fetch functions
export const fetchInicioPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('inicio')
}

export const fetchContactoPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('contacto')
}

export const fetchAvisoLegalPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('aviso-legal')
}

export const fetchPoliticaPrivacidadPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('politica-privacidad')
}

export const fetchPoliticaCookiesPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('politica-de-cookies-ue')
}

export const fetchSobreNosotrasPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('sobre-nosotras')
}

export const fetchQuienesSomosPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('quienes-somos')
}

export const fetchNuestraFilosofiaPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('nuestra-filosofia')
}

export const fetchTerapiaOnlinePage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('terapia-online')
}

export const fetchComoFuncionaPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('como-funciona')
}

export const fetchServiciosPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('servicios')
}

export const fetchPedirCitaPage = async (): Promise<WordPressPage | null> => {
  return fetchPageBySlugSingle('pedir-cita')
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
