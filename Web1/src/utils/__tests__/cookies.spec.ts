import { describe, it, expect, beforeEach } from 'vitest'
import { setCookie, getCookie, deleteCookie, deleteCookiesByPrefix } from '../cookies'

function clearAllCookies() {
  document.cookie.split('; ').forEach((pair) => {
    const name = pair.split('=')[0]
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  })
}

describe('cookies utils', () => {
  beforeEach(() => {
    clearAllCookies()
  })

  describe('setCookie / getCookie', () => {
    it('returns null for a cookie that was never set', () => {
      expect(getCookie('does-not-exist')).toBeNull()
    })

    it('round-trips a plain string value', () => {
      setCookie('kb-test', 'hello', 1)
      expect(getCookie('kb-test')).toBe('hello')
    })

    it('round-trips a JSON string, URL-encoding special characters safely', () => {
      const value = JSON.stringify({ a: 1, b: 'x;y=z', updatedAt: '2026-01-01T00:00:00.000Z' })
      setCookie('kb-json', value, 1)
      expect(getCookie('kb-json')).toBe(value)
    })

    it('does not confuse cookies whose names share a prefix', () => {
      setCookie('kb-test', 'short', 1)
      setCookie('kb-test-extra', 'long', 1)
      expect(getCookie('kb-test')).toBe('short')
      expect(getCookie('kb-test-extra')).toBe('long')
    })
  })

  describe('deleteCookie', () => {
    it('removes a previously set cookie', () => {
      setCookie('kb-test', 'value', 1)
      expect(getCookie('kb-test')).toBe('value')
      deleteCookie('kb-test')
      expect(getCookie('kb-test')).toBeNull()
    })
  })

  describe('deleteCookiesByPrefix', () => {
    it('removes every cookie whose name starts with the given prefix', () => {
      setCookie('_ga', 'GA1.2.111', 1)
      setCookie('_ga_ABCDE12345', 'GS1.1.222', 1)
      setCookie('_gid', 'unrelated-but-different-prefix', 1)
      setCookie('kb-cookie-consent', 'keep-me', 1)

      deleteCookiesByPrefix('_ga')

      expect(getCookie('_ga')).toBeNull()
      expect(getCookie('_ga_ABCDE12345')).toBeNull()
      // "_gid" doesn't start with "_ga" so it must survive the sweep.
      expect(getCookie('_gid')).toBe('unrelated-but-different-prefix')
      expect(getCookie('kb-cookie-consent')).toBe('keep-me')
    })

    it('removes Sourcebuster-style sbjs_ cookies', () => {
      setCookie('sbjs_session', 'session-data', 1)
      setCookie('sbjs_current', 'current-data', 1)
      setCookie('sbjs_udata', 'udata', 1)

      deleteCookiesByPrefix('sbjs_')

      expect(getCookie('sbjs_session')).toBeNull()
      expect(getCookie('sbjs_current')).toBeNull()
      expect(getCookie('sbjs_udata')).toBeNull()
    })

    it('does nothing when no cookie matches the prefix', () => {
      setCookie('unrelated', 'value', 1)
      expect(() => deleteCookiesByPrefix('_ga')).not.toThrow()
      expect(getCookie('unrelated')).toBe('value')
    })
  })
})
