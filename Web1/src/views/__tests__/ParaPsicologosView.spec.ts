import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '../../router'
import ParaPsicologosView from '../ParaPsicologosView.vue'
import type { WordPressPage } from '../../types/api'

vi.mock('../../services/dataService')

import { fetchForPsicologosPage } from '../../services/dataService'

const globalStubs = {
  directives: { 'animate-on-scroll': {}, spotlight: {}, ripple: {} },
  plugins: [router],
}

const CONTENT_HTML = `
  <p>Somos un espacio de apoyo para profesionales de la psicología.</p>
  <h3>Bloque uno</h3>
  <p>Descripción bloque uno</p>
  <h3>Áreas</h3>
  <ul><li>Ansiedad</li><li>Depresión y estado de ánimo</li></ul>
  <blockquote>Una cita inspiradora</blockquote>
  <div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link">Reservar sesión</a></div></div>
  <h4>Cómo funciona</h4>
  <p>Paso 1<br>Descripción paso 1</p>
  <p>Título final<br>Texto final</p>
`

function makePage(): WordPressPage {
  return {
    id: 2,
    date: '2026-01-01T00:00:00',
    date_gmt: '2026-01-01T00:00:00',
    guid: { rendered: 'http://example.com/?p=2' },
    modified: '2026-01-01T00:00:00',
    modified_gmt: '2026-01-01T00:00:00',
    slug: 'for-psychologists',
    status: 'publish',
    type: 'page',
    link: 'http://example.com/para-psicologos',
    title: { rendered: 'Para Psicólogos' },
    content: { rendered: CONTENT_HTML },
    excerpt: { rendered: '<p>extracto</p>' },
    author: 1,
    featured_media: 0,
    comment_status: 'closed',
    ping_status: 'closed',
    sticky: false,
    template: '',
    format: 'standard',
  }
}

describe('ParaPsicologosView', () => {
  it('parses WordPress content and renders lead, quote, blocks, areas and steps', async () => {
    vi.mocked(fetchForPsicologosPage).mockResolvedValue(makePage())

    await router.push('/para-psicologos')
    await router.isReady()
    const wrapper = mount(ParaPsicologosView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Para Psicólogos')
    expect(wrapper.text()).toContain('Somos un espacio de apoyo para profesionales de la psicología.')
    expect(wrapper.text()).toContain('Bloque uno')
    expect(wrapper.text()).toContain('Descripción bloque uno')
    expect(wrapper.text()).toContain('Una cita inspiradora')
    expect(wrapper.text()).toContain('Ansiedad')
    expect(wrapper.text()).toContain('Cómo funciona')
    expect(wrapper.text()).toContain('Paso 1')
    expect(wrapper.text()).toContain('Título final')
    expect(wrapper.text()).toContain('Texto final')
    expect(wrapper.text()).toContain('Reservar sesión')
    expect(wrapper.text()).toContain('Recursos para profesionales')
    expect(wrapper.text()).toContain('Duelo por ruptura')
  })

  it('shows a not-found message when the page does not exist', async () => {
    vi.mocked(fetchForPsicologosPage).mockResolvedValue(null)

    await router.push('/para-psicologos')
    await router.isReady()
    const wrapper = mount(ParaPsicologosView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No se encontró la página.')
  })

  it('shows an error message when the fetch fails', async () => {
    vi.mocked(fetchForPsicologosPage).mockRejectedValue(new Error('boom'))

    await router.push('/para-psicologos')
    await router.isReady()
    const wrapper = mount(ParaPsicologosView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('boom')
  })

  it('links the guide download button straight to the systeme.io page', async () => {
    vi.mocked(fetchForPsicologosPage).mockResolvedValue(makePage())

    await router.push('/para-psicologos')
    await router.isReady()
    const wrapper = mount(ParaPsicologosView, { global: globalStubs })

    await flushPromises()
    await wrapper.vm.$nextTick()

    const link = wrapper.findAll('a').find((a) => a.text() === 'Quiero descargarlo')
    expect(link).toBeTruthy()
    expect(link!.attributes('href')).toBe(
      'https://kanbouripsicologia.systeme.io/duelo-reptura-guia',
    )
    expect(link!.attributes('target')).toBe('_blank')
    expect(link!.attributes('rel')).toBe('noopener noreferrer')
  })
})
