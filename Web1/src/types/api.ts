// WordPress REST API Page types
export interface WordPressPage {
  id: number
  date: string
  date_gmt: string
  guid: {
    rendered: string
    raw?: string
  }
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string
  link: string
  title: {
    rendered: string
    raw?: string
  }
  content: {
    rendered: string
    raw?: string
    protected?: boolean
  }
  excerpt: {
    rendered: string
    raw?: string
    protected?: boolean
  }
  author: number
  featured_media: number
  comment_status: string
  ping_status: string
  sticky: boolean
  template: string
  format: string
  meta?: Record<string, unknown>
  categories?: number[]
  tags?: number[]
  _links?: {
    self?: Array<{ href: string }>
    collection?: Array<{ href: string }>
    about?: Array<{ href: string }>
    author?: Array<{ href: string }>
    replies?: Array<{ href: string }>
    'wp:attachment'?: Array<{ href: string }>
    'wp:term'?: Array<{ href: string; taxonomy: string; embeddable: boolean }>
    curies?: Array<{ name: string; href: string; templated: boolean }>
  }
}

export interface WordPressApiResponse {
  data?: WordPressPage[]
  error?: string
}

// WordPress REST API Media type (imágenes de la biblioteca de medios).
export interface WordPressMedia {
  id: number
  source_url: string
  alt_text?: string
  title?: { rendered: string }
  media_details?: {
    width?: number
    height?: number
    sizes?: Record<string, { source_url: string; width: number; height: number }>
  }
}

// Campos ACF de la página "home" (bloque hero + 4 tarjetas de terapia).
// OJO: "therapy_2_title_" lleva un guion bajo final tal cual está en WordPress.
export interface HomePageAcf {
  hero_title: string
  hero_description: string
  hero_image: number
  hero_button_text: string
  therapy_1_title: string
  therapy_2_title_: string
  therapy_3_title: string
  therapy_4_title: string
  therapy_1_description: string
  therapy_2_description: string
  therapy_3_description: string
  therapy_4_description: string
  therapy_1_image: number
  therapy_2_image: number
  therapy_3_image: number
  therapy_4_image: number
  therapy_1_button_text: string
  therapy_2_button_text: string
  therapy_3_button_text: string
  therapy_4_button_text: string
}

export interface WordPressHomePage extends WordPressPage {
  acf: HomePageAcf
}

// Campos ACF del custom post type "profesional" (una ficha por profesional).
export interface ProfesionalAcf {
  position: string
  hero_image: number
  short_description: string
  work_description: string
  license_number: string
  academic_training: string
  extra_training: string
}

// WordPress REST API Post type (artículos del blog).
// Se pide con `_embed` para traer la imagen destacada y las categorías ya resueltas.
export interface WordPressPost extends WordPressPage {
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      alt_text?: string
    }>
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>
  }
}

export interface ProfesionalPost extends WordPressPost {
  acf: ProfesionalAcf
}

// Campos ACF del custom post type "therapie" (una ficha por terapia/especialidad).
export interface TherapieAcf {
  therapy_name: string
  specialty: string
  therapy_description: string
  therapy_image: number
  when_title: string
  when_items: string
  how_title: string
  how_description: string
  benefits_title: string
  benefits_items: string
}

export interface TherapiePost extends WordPressPost {
  acf: TherapieAcf
}

// Campos ACF del custom post type "setting" usado para el banner de cookies
// (un único post con slug "cookie-kanbouri"). No incluye una categoría de
// "preferencias": solo hay "funcional" (siempre activa, no configurable),
// "estadísticas" y "marketing".
export interface CookieSettingAcf {
  cookie_title: string
  cookie_description: string
  functional_title: string
  functional_status: boolean
  functional_description: string
  statistics_title: string
  statistics_description: string
  marketing_title: string
  marketing_description: string
  accept_button_label: string
  deny_button_label: string
  save_button_label: string
  cookies_policy_url: string
  privacy_policy_url: string
  legal_notice_url: string
  cookie_banner_enabled: boolean
}

export interface CookieSettingPost extends WordPressPost {
  acf: CookieSettingAcf
}

// Campos ACF relevantes del post "setting" con slug "maps": comparte el
// mismo grupo de campos ACF que "cookie-kanbouri" (mismo custom post type),
// pero para esta ficha solo importan estos dos.
export interface MapsSettingAcf {
  enabled: boolean
  embed_url: string
}

export interface MapsSettingPost extends WordPressPost {
  acf: MapsSettingAcf
}

// Reseñas de Google, expuestas por un endpoint propio del WordPress
// (wp-json/kanbouri/v1/reviews), no por la API estándar de WP.
export interface GoogleReview {
  id: string
  user: string
  user_photo: string
  rating: string
  text: string
  reply: string
  date: string
}

// Page slug constants
export const PAGE_SLUGS = {
  HOME: 'home',
  ABOUT_ME: 'about-me',
  FOR_PSICOLOGOS: 'for-psychologists',
  PEDIR_CITA: 'form-appointment',
  AVISO_LEGAL: 'aviso-legal',
  POLITICA_PRIVACIDAD: 'politica-privacidad',
  POLITICA_COOKIES: 'politica-de-cookies-ue',
} as const

export type PageSlug = (typeof PAGE_SLUGS)[keyof typeof PAGE_SLUGS]
