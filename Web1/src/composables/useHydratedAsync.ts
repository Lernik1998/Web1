import { ref, onMounted, type Ref } from 'vue'
import { getEmbeddedHydration, recordHydration } from '../utils/hydration'

/**
 * Igual que el patrón habitual `ref(true)` / `ref(null)` + `onMounted(async
 * () => { try/catch/finally })`, pero comprobando antes si el HTML ya trae
 * incrustados (desde el pre-renderizado) los datos de esta llamada: si es
 * así, `data`/`loading` arrancan ya resueltos ANTES del primer render (no
 * dentro de `onMounted`, que se ejecuta después), así que no hay parpadeo de
 * "cargando" ni segunda petición a la API.
 *
 * `key` solo necesita ser único dentro de una misma página, no entre
 * páginas distintas: cada ruta pre-renderizada incrusta solo sus propios
 * datos.
 */
export function useHydratedAsync<T>(key: string, loader: () => Promise<T>) {
  const embedded = getEmbeddedHydration()?.[key] as T | undefined
  const data = ref<T | undefined>(embedded) as Ref<T | undefined>
  const loading = ref(embedded === undefined)
  const error = ref<string | null>(null)

  async function run() {
    if (embedded !== undefined) {
      // Deja constancia para que el próximo pre-renderizado también capture
      // estos datos (si no se re-ejecutara el loader, no habría nada que
      // volver a incrustar en el siguiente build).
      recordHydration(key, embedded)
      return
    }
    loading.value = true
    error.value = null
    try {
      const result = await loader()
      data.value = result
      recordHydration(key, result)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      console.error(`Error cargando datos hidratados (${key}):`, err)
    } finally {
      loading.value = false
    }
  }

  onMounted(run)

  return { data, loading, error, reload: run }
}
