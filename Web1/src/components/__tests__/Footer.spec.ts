import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import Footer from '../Footer.vue'
import { fetchMapsSetting } from '../../services/dataService'
import type { MapsSettingPost } from '../../types/api'

vi.mock('../../services/dataService', () => ({
  fetchMapsSetting: vi.fn<() => Promise<MapsSettingPost | null>>(),
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
})
