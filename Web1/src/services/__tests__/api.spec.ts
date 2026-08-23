import { describe, it, expect, vi, afterEach } from 'vitest'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import apiClient from '../api'

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
})
