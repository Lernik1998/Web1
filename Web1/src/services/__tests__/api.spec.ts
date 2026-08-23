import { describe, it, expect, vi, afterEach } from 'vitest'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import apiClient, { cachedGet } from '../api'

// Axios stores registered interceptors in an internal (untyped) `handlers`
// array on `interceptors.request`/`interceptors.response`. We reach into it
// directly to exercise the fulfilled/rejected callbacks without making a
// real HTTP request.
interface InterceptorHandler<T> {
  fulfilled: (value: T) => T | Promise<T>
  rejected: (error: AxiosError) => Promise<never>
}

function getRequestHandler(): InterceptorHandler<InternalAxiosRequestConfig> {
  const handlers = (
    apiClient.interceptors.request as unknown as {
      handlers: Array<InterceptorHandler<InternalAxiosRequestConfig> | null>
    }
  ).handlers
  const handler = handlers[0]
  if (!handler) throw new Error('No request interceptor registered')
  return handler
}

function getResponseHandler(): InterceptorHandler<AxiosResponse> {
  const handlers = (
    apiClient.interceptors.response as unknown as {
      handlers: Array<InterceptorHandler<AxiosResponse> | null>
    }
  ).handlers
  const handler = handlers[0]
  if (!handler) throw new Error('No response interceptor registered')
  return handler
}

describe('apiClient', () => {
  it('is configured with the expected baseURL, headers and timeout', () => {
    expect(apiClient.defaults.baseURL).toBe('https://kanbouripsicologia.com')
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
    expect(apiClient.defaults.timeout).toBe(10000)
  })

  it('wires a request interceptor that passes through a valid config unchanged', async () => {
    const handler = getRequestHandler()
    const config = { url: '/foo', headers: {} } as InternalAxiosRequestConfig
    const result = await handler.fulfilled(config)
    expect(result).toBe(config)
  })

  it('wires a request interceptor that rejects on error via Promise.reject', async () => {
    const handler = getRequestHandler()
    const error = new Error('request boom') as AxiosError
    await expect(handler.rejected(error)).rejects.toBe(error)
  })

  it('wires a response interceptor that passes through a valid response unchanged', async () => {
    const handler = getResponseHandler()
    const response = { status: 200, data: {} } as AxiosResponse
    const result = await handler.fulfilled(response)
    expect(result).toBe(response)
  })

  describe('response interceptor error handling', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('logs and rejects with the original error via Promise.reject', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const handler = getResponseHandler()
      const error = new Error('response boom') as AxiosError
      await expect(handler.rejected(error)).rejects.toBe(error)
      expect(consoleSpy).toHaveBeenCalledWith('API Error:', error)
    })
  })

  // Sin esta caché, cada navegación interna dentro de la SPA (terapias
  // relacionadas, migas de pan, volver a una página ya vista...) volvía a
  // pedir a WordPress datos ya pedidos en la misma sesión, mostrando otra
  // vez "Cargando" mientras llegaba la respuesta -- ver useLinkPrefetch.ts,
  // que además dispara estas mismas peticiones por adelantado al pasar el
  // ratón por un enlace. La caché vive en el módulo (no se resetea entre
  // tests de este fichero), así que cada test usa su propia URL de mentira
  // para no interferir con los demás.
  describe('cachedGet', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('only issues one real request for repeated calls to the same URL', async () => {
      const getSpy = vi
        .spyOn(apiClient, 'get')
        .mockResolvedValue({ data: { ok: true } } as AxiosResponse)

      const [first, second] = await Promise.all([
        cachedGet('/cachedGet-test-dedupe'),
        cachedGet('/cachedGet-test-dedupe'),
      ])

      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(first).toBe(second)

      // Una tercera llamada posterior (ya resuelta la primera) también debe
      // servirse de la caché en vez de disparar otra petición.
      await cachedGet('/cachedGet-test-dedupe')
      expect(getSpy).toHaveBeenCalledTimes(1)
    })

    it('issues separate requests for different URLs', async () => {
      const getSpy = vi
        .spyOn(apiClient, 'get')
        .mockResolvedValue({ data: {} } as AxiosResponse)

      await cachedGet('/cachedGet-test-a')
      await cachedGet('/cachedGet-test-b')

      expect(getSpy).toHaveBeenCalledTimes(2)
      expect(getSpy).toHaveBeenCalledWith('/cachedGet-test-a')
      expect(getSpy).toHaveBeenCalledWith('/cachedGet-test-b')
    })

    it('does not cache a failed request, so a later call retries it', async () => {
      const getSpy = vi
        .spyOn(apiClient, 'get')
        .mockRejectedValueOnce(new Error('network down'))
        .mockResolvedValueOnce({ data: { ok: true } } as AxiosResponse)

      await expect(cachedGet('/cachedGet-test-retry')).rejects.toThrow('network down')

      const result = await cachedGet('/cachedGet-test-retry')

      expect(getSpy).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ data: { ok: true } })
    })
  })
})
