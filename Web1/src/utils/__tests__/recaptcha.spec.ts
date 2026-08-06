import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

function clearInjectedScript() {
  document.getElementById('kb-recaptcha-script')?.remove()
}

describe('getRecaptchaToken', () => {
  beforeEach(() => {
    clearInjectedScript()
    delete (window as unknown as { grecaptcha?: unknown }).grecaptcha
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    clearInjectedScript()
  })

  it('returns null without touching the DOM when there is no site key configured', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', '')
    const { getRecaptchaToken } = await import('../recaptcha')

    const token = await getRecaptchaToken('pedir_cita')

    expect(token).toBeNull()
    expect(document.getElementById('kb-recaptcha-script')).toBeNull()
  })

  it('injects the script and resolves the token from window.grecaptcha when a site key is configured', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'test-site-key')
    const { getRecaptchaToken } = await import('../recaptcha')

    // Simula la carga real del script de Google: en cuanto se añade al
    // documento, deja `window.grecaptcha` listo para usarse.
    const originalAppendChild = document.head.appendChild.bind(document.head)
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      const result = originalAppendChild(node as Node)
      if (node instanceof HTMLScriptElement) {
        window.grecaptcha = {
          ready: (cb) => cb(),
          execute: vi.fn<() => Promise<string>>().mockResolvedValue('token-123'),
        }
        node.onload?.(new Event('load'))
      }
      return result
    })

    const token = await getRecaptchaToken('pedir_cita')

    expect(token).toBe('token-123')
    const script = document.getElementById('kb-recaptcha-script')
    expect(script?.getAttribute('src')).toContain('render=test-site-key')
    expect(window.grecaptcha?.execute).toHaveBeenCalledWith('test-site-key', {
      action: 'pedir_cita',
    })
  })

  it('does not inject the script twice on repeated calls', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'test-site-key')
    const { getRecaptchaToken } = await import('../recaptcha')

    const originalAppendChild = document.head.appendChild.bind(document.head)
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      const result = originalAppendChild(node as Node)
      if (node instanceof HTMLScriptElement) {
        window.grecaptcha = {
          ready: (cb) => cb(),
          execute: vi.fn<() => Promise<string>>().mockResolvedValue('token-abc'),
        }
        node.onload?.(new Event('load'))
      }
      return result
    })

    await getRecaptchaToken('pedir_cita')
    await getRecaptchaToken('pedir_cita')

    expect(document.querySelectorAll('#kb-recaptcha-script').length).toBe(1)
  })

  it('rejects when the script fails to load and a site key is configured', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'test-site-key')
    const { getRecaptchaToken } = await import('../recaptcha')

    const originalAppendChild = document.head.appendChild.bind(document.head)
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      const result = originalAppendChild(node as Node)
      if (node instanceof HTMLScriptElement) {
        node.onerror?.(new Event('error'))
      }
      return result
    })

    await expect(getRecaptchaToken('pedir_cita')).rejects.toThrow(
      'No se pudo cargar el script de reCAPTCHA.',
    )
  })

  it('rejects when grecaptcha.execute rejects', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'test-site-key')
    const { getRecaptchaToken } = await import('../recaptcha')

    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: vi.fn<() => Promise<string>>().mockRejectedValue(new Error('execute failed')),
    }

    await expect(getRecaptchaToken('pedir_cita')).rejects.toThrow('execute failed')
  })
})
