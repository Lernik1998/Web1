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

// Page slug constants
export const PAGE_SLUGS = {
  HOME: 'home',
  ABOUT_ME: 'about-me',
  TEAM: 'team',
  ONLINE_THERAPY: 'onlinetherpy',
  INFANTIL: 'infantil',
  ADOLESCENTES: 'adolescentes',
  ADULTOS: 'adultos',
  ANSIEDAD: 'ansiedad',
  DEPRESION: 'depresion',
  AUTOESTIMA: 'autoestima',
  DUELO: 'duelo',
  PADRES: 'padres',
  FOR_PSICOLOGOS: 'forpsicologs',
  BLOG: 'blog',
  PEDIR_CITA: 'pedircita',
  INICIO: 'inicio',
  CONTACTO: 'contacto',
  AVISO_LEGAL: 'aviso-legal',
  POLITICA_PRIVACIDAD: 'politica-privacidad',
  POLITICA_COOKIES: 'politica-de-cookies-ue',
  SOBRE_NOSOTRAS: 'sobre-nosotras',
  QUIENES_SOMOS: 'quienes-somos',
  NUESTRA_FILOSOFIA: 'nuestra-filosofia',
  TERAPIA_ONLINE: 'terapia-online',
  COMO_FUNCIONA: 'como-funciona',
  SERVICIOS: 'servicios',
} as const

export type PageSlug = (typeof PAGE_SLUGS)[keyof typeof PAGE_SLUGS]
