// Puente entre el HTML pre-renderizado (scripts/prerender.mjs) y el arranque
// de la app en el cliente (main.ts): permite reutilizar en el primer render
// los datos que ya se pidieron a la API durante el pre-renderizado, en vez
// de volver a pedirlos y provocar el salto de layout típico de "loading →
// contenido". Ver composables/useHydratedAsync.ts para el uso real.
declare global {
  interface Window {
    __KB_HYDRATION__?: Record<string, unknown>
    __KB_HYDRATION_CAPTURE__?: Record<string, unknown>
  }
}

export function getEmbeddedHydration(): Record<string, unknown> | null {
  return window.__KB_HYDRATION__ ?? null
}

export function recordHydration(key: string, value: unknown): void {
  if (!window.__KB_HYDRATION_CAPTURE__) {
    window.__KB_HYDRATION_CAPTURE__ = {}
  }
  window.__KB_HYDRATION_CAPTURE__[key] = value
}
