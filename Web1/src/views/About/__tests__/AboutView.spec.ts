import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AboutView from '../AboutView.vue'
import router from '../../../router'
import type { WordPressPage } from '../../../types/api'

const { fetchAboutMePageMock } = vi.hoisted(() => ({
  fetchAboutMePageMock: vi.fn<() => Promise<WordPressPage | null>>(),
}))

vi.mock('../../../services/dataService', () => ({
  fetchAboutMePage: fetchAboutMePageMock,
}))

const ABOUT_HTML =
  '<p><strong>Ana García</strong></p><p><strong>Psicóloga Infantil</strong></p>' +
  '<p>Bio paragraph one.</p><figure><img src="/photo.jpg"></figure>' +
  '<p>Formación académica</p><ul><li>Grado en Psicología</li></ul>' +
  '<p>Formación extracurricular</p><ul><li>Curso de terapia infantil</li></ul>'

function makePage(html: string): WordPressPage {
  return {
    id: 1,
    date: '',
    date_gmt: '',
    guid: { rendered: '' },
    modified: '',
    modified_gmt: '',
    slug: 'about-me',
    status: 'publish',
    type: 'page',
    link: '',
    title: { rendered: 'Sobre mí' },
    content: { rendered: html },
    excerpt: { rendered: '' },
    author: 1,
    featured_media: 0,
    comment_status: '',
    ping_status: '',
    sticky: false,
    template: '',
    format: '',
  }
}

const globalStubs = {
  directives: {
    'animate-on-scroll': {},
    spotlight: {},
    ripple: {},
  },
  plugins: [router],
}

describe('AboutView', () => {
  beforeEach(() => {
    fetchAboutMePageMock.mockReset()
  })

  it('shows a loading state before the page resolves', async () => {
    fetchAboutMePageMock.mockReturnValue(new Promise(() => {}))
    await router.push('/sobre-mi')
    await router.isReady()

    const wrapper = mount(AboutView, { global: globalStubs })
    expect(wrapper.text()).toContain('Cargando')
  })

  it('renders the parsed "sobre mí" member with photo, bio and formación lists', async () => {
    fetchAboutMePageMock.mockResolvedValue(makePage(ABOUT_HTML))
    await router.push('/sobre-mi')
    await router.isReady()

    const wrapper = mount(AboutView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Ana García')
    expect(wrapper.text()).toContain('Psicóloga Infantil')
    expect(wrapper.text()).toContain('Bio paragraph one.')
    expect(wrapper.text()).toContain('Grado en Psicología')
    expect(wrapper.text()).toContain('Curso de terapia infantil')

    const img = wrapper.find('.kb-about__image')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/photo.jpg')

    // Igual que en la ficha de cualquier otra profesional: esta página
    // también debe llevar datos estructurados Person.
    const schema = document.getElementById('kb-person-schema')
    expect(schema).not.toBeNull()
    const parsed = JSON.parse(schema!.textContent ?? '{}')
    expect(parsed['@type']).toBe('Person')
    expect(parsed.name).toBe('Ana García')
    expect(parsed.url).toBe('https://kanbouripsicologia.com/sobre-mi')
  })

  it('shows an error message when the fetch fails', async () => {
    fetchAboutMePageMock.mockRejectedValue(new Error('network down'))
    await router.push('/sobre-mi')
    await router.isReady()

    const wrapper = mount(AboutView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('Error: network down')
  })

  it('shows a not-found message when there is no page', async () => {
    fetchAboutMePageMock.mockResolvedValue(null)
    await router.push('/sobre-mi')
    await router.isReady()

    const wrapper = mount(AboutView, { global: globalStubs })
    await flushPromises()

    expect(wrapper.text()).toContain('No se encontró la página "Sobre mí".')
  })
})
