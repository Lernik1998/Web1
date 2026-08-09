/**
 * Utilidades mínimas de lectura/escritura de cookies del navegador (no HTTP
 * only, así que solo sirven para cookies que gestiona el propio front-end).
 */

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function setCookie(name: string, value: string, days: number): void {
  const maxAgeSeconds = Math.round(days * 24 * 60 * 60)
  // `Secure` exige HTTPS para leer/escribir la cookie: se omite en
  // localhost/http (desarrollo) porque el navegador la rechazaría en ese
  // contexto, pero se aplica siempre en producción (servida por HTTPS).
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax${secure}`
}

export function getCookie(name: string): string | null {
  const pattern = new RegExp(`(?:^|; )${escapeForRegExp(name)}=([^;]*)`)
  const match = document.cookie.match(pattern)
  return match?.[1] !== undefined ? decodeURIComponent(match[1]) : null
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; max-age=0; path=/`
}

/**
 * Borra todas las cookies cuyo nombre empiece por `prefix` (p. ej. "_ga" para
 * las de Google Analytics, o "sbjs_" para las de Sourcebuster), ya que estas
 * herramientas suelen crear varias cookies con sufijos distintos en vez de
 * una sola con nombre fijo.
 */
export function deleteCookiesByPrefix(prefix: string): void {
  const names = document.cookie
    .split('; ')
    .map((pair) => pair.split('=')[0]?.trim())
    .filter((name): name is string => Boolean(name))

  for (const name of names) {
    if (name.startsWith(prefix)) deleteCookie(name)
  }
}
