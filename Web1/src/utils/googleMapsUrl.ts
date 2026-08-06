export interface StreetViewParams {
  lat: number
  lng: number
  heading: number
  pitch: number
}

/**
 * Extrae lat/lng/heading/pitch de una URL "completa" de Google Maps en modo
 * Street View, con forma `@LAT,LNG,3a,FOVy,HEADINGh,TILTt` (el formato que
 * usa la propia app de Google Maps al compartir una vista de calle).
 *
 * OJO: los enlaces cortos `https://maps.app.goo.gl/...` (los que genera el
 * botón "Compartir" de Google Maps) NO se pueden resolver desde el
 * navegador: son una redirección 301 a otro origen, y la política CORS
 * impide leer esa redirección con JS. Por eso esta función solo sabe leer
 * URLs ya expandidas; si WordPress guarda un enlace corto, se usa el
 * encuadre de respaldo (ver Footer.vue).
 */
export function parseStreetViewUrl(url: string): StreetViewParams | null {
  if (!url) return null

  const match = url.match(
    /@(-?\d+\.\d+),(-?\d+\.\d+),3a,[\d.]+y,(-?\d+\.?\d*)h,(-?\d+\.?\d*)t/,
  )
  if (!match) return null

  const [, latStr, lngStr, headingStr, tiltStr] = match
  const lat = Number(latStr)
  const lng = Number(lngStr)
  const heading = Number(headingStr)
  const tilt = Number(tiltStr)

  if ([lat, lng, heading, tilt].some((n) => Number.isNaN(n))) return null

  // En la URL de Google Maps, tilt=90 es mirar al horizonte; el pitch que
  // espera el embed de Street View es justo el complementario.
  const pitch = 90 - tilt

  return { lat, lng, heading, pitch }
}

/**
 * Construye la URL del iframe de Street View (sin API key, vía el parámetro
 * no oficial pero ampliamente usado `output=svembed`) a partir de unos
 * parámetros de encuadre.
 */
export function buildStreetViewEmbedSrc({ lat, lng, heading, pitch }: StreetViewParams): string {
  return `https://www.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,${heading},,0,${pitch}&output=svembed`
}
