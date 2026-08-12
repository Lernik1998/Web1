import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import Footer from '../Footer.vue'
import { fetchMapsSetting, fetchFooterInformation } from '../../services/dataService'
import type { MapsSettingPost, FooterInformationPost } from '../../types/api'

vi.mock('../../services/dataService', () => ({
  fetchMapsSetting: vi.fn<() => Promise<MapsSettingPost | null>>(),
  fetchFooterInformation: vi.fn<() => Promise<FooterInformationPost | null>>(),
}))

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

function makeMapsSetting(acf: Partial<MapsSettingPost['acf']> = {}): MapsSettingPost {
  return {
    acf: {
      enabled: true,
      embed_url: '',
      ...acf,
    },
  } as MapsSettingPost
}

function makeFooterInformation(
  acf: Partial<FooterInformationPost['acf']> = {},
): FooterInformationPost {
  return {
    acf: {
      address: 'C/ Sant Josep 31, Planta Baja Izquierda · Dénia (Alicante)',
      address_link: { title: '', url: 'https://maps.example.com/kanbouri', target: '_blank' },
      phone: '+34 629 538 062',
      email: 'gabinete@kanbouripsicologia.com',
      schedule: 'Lunes a Viernes · 12:00 a 20:00 ·',
      ...acf,
    },
  } as FooterInformationPost
}

async function mountFooter() {
  const wrapper = mount(Footer, {
    global: {
      directives,
      stubs: { RouterLink: RouterLinkStub },
    },
  })
  await flushPromises()
  return wrapper
}

describe('Footer', () => {
  beforeEach(() => {
    vi.mocked(fetchMapsSetting).mockReset()
    vi.mocked(fetchMapsSetting).mockResolvedValue(null)
    vi.mocked(fetchFooterInformation).mockReset()
    vi.mocked(fetchFooterInformation).mockResolvedValue(null)
  })

  it('renders brand, contact info and legal links', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('Kanbouri')
    expect(wrapper.text()).toContain('gabinete@kanbouripsicologia.com')
    expect(wrapper.text()).toContain('+34 629 538 062')
    expect(wrapper.text().toLowerCase()).toContain('privacidad')
    expect(wrapper.text()).toContain('Aviso legal')
    expect(wrapper.text().toLowerCase()).toContain('cookies')
  })

  it('renders the current year in the bottom bar', async () => {
    const wrapper = await mountFooter()

    const year = new Date().getFullYear().toString()
    expect(wrapper.find('.footer-bottom').text()).toContain(year)
  })

  it('renders social links', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.find('a[aria-label="Facebook"]').exists()).toBe(true)
    expect(wrapper.find('a[aria-label="Instagram"]').exists()).toBe(true)

    const linkedin = wrapper.find('a[aria-label="LinkedIn"]')
    expect(linkedin.exists()).toBe(true)
    expect(linkedin.attributes('href')).toBe('https://www.linkedin.com/in/maria-b-kanbouri-a88aa816a/')
    expect(linkedin.attributes('target')).toBe('_blank')
    expect(linkedin.attributes('rel')).toBe('noopener noreferrer')
  })

  it('shows a fallback Street View embed when there is no WordPress setting yet', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.find('.footer-map').exists()).toBe(true)
    expect(wrapper.find('.footer-map__frame').attributes('src')).toContain('output=svembed')
  })

  it('hides the map entirely when the WordPress setting disables it', async () => {
    vi.mocked(fetchMapsSetting).mockResolvedValue(makeMapsSetting({ enabled: false }))

    const wrapper = await mountFooter()

    expect(wrapper.find('.footer-map').exists()).toBe(false)
  })

  it('builds the embed src from a resolvable (non-shortened) embed_url', async () => {
    vi.mocked(fetchMapsSetting).mockResolvedValue(
      makeMapsSetting({
        embed_url:
          'https://www.google.com/maps/place/Foo/@40.4167,-3.7033,3a,90y,120h,80t/data=!3m1!1e1',
      }),
    )

    const wrapper = await mountFooter()

    const src = wrapper.find('.footer-map__frame').attributes('src')
    expect(src).toContain('cbll=40.4167,-3.7033')
    expect(src).toContain('cbp=12,120,,0,10')
  })

  it('falls back to the default framing when embed_url is an unresolvable short link', async () => {
    vi.mocked(fetchMapsSetting).mockResolvedValue(
      makeMapsSetting({ embed_url: 'https://maps.app.goo.gl/someShortCode' }),
    )

    const wrapper = await mountFooter()

    const src = wrapper.find('.footer-map__frame').attributes('src')
    expect(src).toContain('cbll=38.8386523,0.1060985')
  })

  it('uses the hardcoded contact defaults when there is no WordPress footer-information setting yet', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('C/ Sant Josep 31, Planta Baja Izquierda · Dénia (Alicante)')
    expect(wrapper.text()).toContain('+34 629 538 062')
    expect(wrapper.text()).toContain('gabinete@kanbouripsicologia.com')
    expect(wrapper.text()).toContain('Lunes a Viernes · 12:00 a 20:00 ·')
    expect(wrapper.find('a[href="tel:+34629538062"]').exists()).toBe(true)
    expect(wrapper.find('a[href="mailto:gabinete@kanbouripsicologia.com"]').exists()).toBe(true)
  })

  it('replaces the contact info with the values from the WordPress "footer-information" post', async () => {
    vi.mocked(fetchFooterInformation).mockResolvedValue(
      makeFooterInformation({
        address: 'Calle Nueva 42, Dénia',
        address_link: { title: '', url: 'https://maps.example.com/nueva', target: '_blank' },
        phone: '+34 600 111 222',
        email: 'nuevo@kanbouripsicologia.com',
        schedule: 'Lunes a Sábado · 09:00 a 21:00 ·',
      }),
    )

    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('Calle Nueva 42, Dénia')
    expect(wrapper.text()).not.toContain('C/ Sant Josep 31')
    expect(wrapper.text()).toContain('+34 600 111 222')
    expect(wrapper.text()).toContain('nuevo@kanbouripsicologia.com')
    expect(wrapper.text()).toContain('Lunes a Sábado · 09:00 a 21:00 ·')

    const addressLink = wrapper.find('a[href="https://maps.example.com/nueva"]')
    expect(addressLink.exists()).toBe(true)
    expect(addressLink.attributes('target')).toBe('_blank')
    expect(addressLink.attributes('rel')).toBe('noopener noreferrer')

    expect(wrapper.find('a[href="tel:+34600111222"]').exists()).toBe(true)
    expect(wrapper.find('a[href="mailto:nuevo@kanbouripsicologia.com"]').exists()).toBe(true)
  })

  it('keeps the hardcoded defaults for any field left empty in WordPress instead of showing a blank value', async () => {
    vi.mocked(fetchFooterInformation).mockResolvedValue(
      makeFooterInformation({ phone: '', email: '' }),
    )

    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('+34 629 538 062')
    expect(wrapper.text()).toContain('gabinete@kanbouripsicologia.com')
  })

  it('does not break the rest of the footer when fetchFooterInformation rejects', async () => {
    vi.mocked(fetchFooterInformation).mockRejectedValue(new Error('network error'))

    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('+34 629 538 062')
    expect(wrapper.find('.footer-map').exists()).toBe(true)
  })
})
