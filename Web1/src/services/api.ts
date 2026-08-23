import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Caché en memoria de peticiones GET, viva mientras dure la pestaña (una
// recarga completa de página la resetea). Esta es una SPA sin recargar
// entre secciones: sin esto, cada navegación interna (terapias
// relacionadas, migas de pan, fichas de equipo, volver a una página ya
// vista...) volvía a pedir a WordPress datos que ya se habían pedido antes
// en la misma sesión, mostrando de nuevo el estado de "Cargando" mientras
// llegaba la respuesta. Se guarda la propia promesa (no solo el resultado
// ya resuelto) para que dos peticiones casi simultáneas a la misma URL --
// p. ej. el precargado al pasar el ratón por un enlace y el `onMounted` de
// la vista de destino llegando justo después -- compartan la misma
// petición en curso en vez de duplicarla.
const getCache = new Map<string, Promise<unknown>>()

export function cachedGet<T>(url: string) {
  const cached = getCache.get(url)
  if (cached) return cached as ReturnType<typeof apiClient.get<T>>

  const request = apiClient.get<T>(url).catch((error: unknown) => {
    // Una petición fallida no se cachea: si se cacheara, un fallo de red
    // puntual (o el WordPress caído un instante) dejaría esa página rota
    // el resto de la sesión aunque la API se recuperase enseguida después.
    getCache.delete(url)
    throw error
  })
  getCache.set(url, request)
  return request
}

export default apiClient
