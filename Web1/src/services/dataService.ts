import apiClient from './api'
import type {
  WordPressPage,
  WordPressPost,
  WordPressMedia,
  WordPressHomePage,
  ProfesionalPost,
  TherapiePost,
  CookieSettingPost,
  MapsSettingPost,
  FooterInformationPost,
  GoogleReview,
  PageSlug,
} from '../types/api'

// Listado y ficha individual de las profesionales (custom post type
// "profesional", un post por persona, no una página de WordPress). El
// contenido real (rol, biografía, formación) vive en los campos ACF, no en
// `content.rendered` (que WordPress deja vacío para este tipo de post).
export const fetchProfesionales = async (): Promise<ProfesionalPost[]> => {
  const response = await apiClient.get<ProfesionalPost[]>(
    '/wp-json/wp/v2/profesional?_embed&per_page=100',
  )
  return response.data
}

export const fetchProfesionalBySlug = async (slug: string): Promise<ProfesionalPost | null> => {
  const response = await apiClient.get<ProfesionalPost[]>(
    `/wp-json/wp/v2/profesional?slug=${slug}&_embed`,
  )
  return response.data.length > 0 ? (response.data[0] ?? null) : null
}

// Ficha de una terapia (custom post type "therapie"). Igual que "profesional",
// el contenido real (intro, listas, textos) vive en los campos ACF, no en
// `content.rendered`.
export const fetchTherapieBySlug = async (slug: string): Promise<TherapiePost | null> => {
  const response = await apiClient.get<TherapiePost[]>(
    `/wp-json/wp/v2/therapie?slug=${slug}&_embed`,
  )
  return response.data.length > 0 ? (response.data[0] ?? null) : null
}

// Textos y ajustes del banner de cookies (custom post type "setting", un
// único post con slug "cookie-kanbouri"), editable desde WordPress.
export const fetchCookieSetting = async (): Promise<CookieSettingPost | null> => {
  const response = await apiClient.get<CookieSettingPost[]>(
    '/wp-json/wp/v2/setting?slug=cookie-kanbouri',
  )
  return response.data.length > 0 ? (response.data[0] ?? null) : null
}

// Activar/desactivar el mapa del footer y el enlace de Google Maps que debe
// mostrar (custom post type "setting", único post con slug "maps").
export const fetchMapsSetting = async (): Promise<MapsSettingPost | null> => {
  const response = await apiClient.get<MapsSettingPost[]>('/wp-json/wp/v2/setting?slug=maps')
  return response.data.length > 0 ? (response.data[0] ?? null) : null
}

// Datos de contacto del footer (dirección, teléfono, email, horario):
// custom post type "footer-information", único post con slug "footer".
export const fetchFooterInformation = async (): Promise<FooterInformationPost | null> => {
  const response = await apiClient.get<FooterInformationPost[]>(
    '/wp-json/wp/v2/footer-information?slug=footer',
  )
  return response.data.length > 0 ? (response.data[0] ?? null) : null
}

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
  return fetchPageBySlugProcessed('form-appointment')
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

export interface BlogPostsPage {
  posts: WordPressPost[]
  totalPages: number
}

// Artículos del blog (WordPress posts, no páginas). `_embed` trae la imagen
// destacada y las categorías ya resueltas para no hacer peticiones extra.
// `orderby=date&order=desc` deja explícito que los más recientes van primero
// (es el valor por defecto de WordPress, pero así no depende de que nadie lo
// cambie sin darse cuenta). `X-WP-TotalPages` es la cabecera que WordPress
// devuelve con el nº de páginas real para ese `per_page`.
export const fetchBlogPosts = async (page = 1, perPage = 3): Promise<BlogPostsPage> => {
  const response = await apiClient.get<WordPressPost[]>(
    `/wp-json/wp/v2/posts?_embed&orderby=date&order=desc&per_page=${perPage}&page=${page}`,
  )
  const totalPages = Number(response.headers['x-wp-totalpages']) || 1
  return { posts: response.data, totalPages }
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

// Alta en la newsletter de "Para Psicólogos" (endpoint propio del WordPress).
// `recaptcha_token` sigue el mismo contrato que `submitAppointmentRequest`
// más abajo: `null` si el sitio no tiene configurada
// `VITE_RECAPTCHA_SITE_KEY`, y si no el backend debe verificarlo contra la
// API "siteverify" de Google antes de dar de alta el email.
export const subscribeToNewsletter = async (
  name: string,
  email: string,
  recaptchaToken: string | null,
): Promise<void> => {
  await apiClient.post('/wp-json/kanbouri/v1/appointment', {
    name,
    email,
    recaptcha_token: recaptchaToken,
  })
}

// Forma exacta que espera `kanbouri_send_appointment_email()` en el plugin
// de WordPress (`services/mail.php`): nombres de campo en inglés, y
// `weekdays`/`schedule` como arrays (aunque el formulario solo deje elegir
// un día y una franja horaria, se envían como array de un elemento porque
// el backend los recorre con `implode(', ', ...)`).
export interface AppointmentRequestPayload {
  name: string
  surname: string
  email: string
  phone: string
  therapy: string
  appointment_type: string
  psychologist: string
  weekdays: string[]
  schedule: string[]
  source: string
  message: string
  // Token de reCAPTCHA v3 (o `null` si el sitio no tiene configurada
  // `VITE_RECAPTCHA_SITE_KEY`); el backend lo verifica contra la API
  // "siteverify" de Google antes de enviar el email.
  recaptcha_token: string | null
}

// Solicitud de cita del formulario "Pedir cita" (endpoint propio del
// WordPress, distinto del de la newsletter de arriba): el backend verifica
// el token de reCAPTCHA y, si es válido, envía el email al centro.
export const submitAppointmentRequest = async (
  payload: AppointmentRequestPayload,
): Promise<void> => {
  await apiClient.post('/wp-json/kanbouri/v1/book-appointment', payload)
}
