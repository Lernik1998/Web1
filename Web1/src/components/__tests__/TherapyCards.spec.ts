import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount, RouterLinkStub } from '@vue/test-utils'
import TherapyCards from '../TherapyCards.vue'

const directives = { 'animate-on-scroll': {}, spotlight: {}, ripple: {} }

const twoCards = [
  {
    title: 'Psicologia infantil',
    description: 'Acompanamiento para los mas pequenos.',
    imageUrl: '/images/infantil.jpg',
    buttonText: 'Saber mas',
    href: '/terapias/infantil',
  },
  {
    title: 'Psicologia para adultos',
    description: 'Terapia para adultos en distintas etapas.',
    imageUrl: '/images/adultos.jpg',
    buttonText: 'Saber mas',
    href: '/terapias/adultos',
  },
]

const twoCardsOneCustomPosition = [
  twoCards[0]!,
  { ...twoCards[1]!, imagePosition: 'center 85%' },
]

const fourCards = [
  ...twoCards,
  {
    title: 'Psicologia para adolescentes',
    description: 'Terapia para adolescentes.',
    imageUrl: '/images/adolescentes.jpg',
    buttonText: 'Saber mas',
    href: '/terapias/adolescentes',
  },
  {
    title: 'Psicologia para padres y familia',
    description: 'Terapia familiar.',
    imageUrl: '/images/familia.jpg',
    buttonText: 'Saber mas',
    href: '/terapias/padres-familia',
  },
]

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi
    .fn<(query: string) => MediaQueryList>()
    .mockImplementation(
      (query: string) =>
        ({
          matches,
          media: query,
          addEventListener: vi.fn<(...args: unknown[]) => void>(),
          removeEventListener: vi.fn<(...args: unknown[]) => void>(),
        }) as unknown as MediaQueryList,
    )
}

/**
 * Monta el componente y espera al `nextTick`: `onMounted` recalcula
 * `itemsPerView` según el ancho real (jsdom = 1024px, distinto del valor
 * por defecto usado antes de montar) y Vue aplica ese cambio al DOM de
 * forma asíncrona, no en el mismo tick del `mount()`.
 */
async function mountCards(cards: typeof twoCards) {
  const wrapper = mount(TherapyCards, {
    global: { directives, stubs: { RouterLink: RouterLinkStub } },
    props: { cards },
  })
  await nextTick()
  return wrapper
}

describe('TherapyCards', () => {
  beforeEach(() => {
    // jsdom no implementa matchMedia por defecto.
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('without enough cards to loop (fits in one row)', () => {
    it('renders one card per item in the cards prop, without clones', async () => {
      const wrapper = await mountCards(twoCards)

      expect(wrapper.findAll('.kb-card')).toHaveLength(2)
    })

    it('renders title, description and image for each card', async () => {
      const wrapper = await mountCards(twoCards)

      expect(wrapper.text()).toContain('Psicologia infantil')
      expect(wrapper.text()).toContain('Acompanamiento para los mas pequenos.')

      const images = wrapper.findAll('img.kb-card__image')
      expect(images[0]!.attributes('src')).toBe('/images/infantil.jpg')
      expect(images[0]!.attributes('alt')).toBe('Psicologia infantil')
    })

    it('links each card to its href', async () => {
      const wrapper = await mountCards(twoCards)

      const links = wrapper.findAllComponents(RouterLinkStub)
      expect(links).toHaveLength(2)
      expect(links[0]!.props('to')).toBe('/terapias/infantil')
      expect(links[1]!.props('to')).toBe('/terapias/adultos')
    })

    it('does not render carousel arrows or dots', async () => {
      const wrapper = await mountCards(twoCards)

      expect(wrapper.find('.kb-therapies__arrow').exists()).toBe(false)
      expect(wrapper.find('.kb-therapies__controls').exists()).toBe(false)
    })

    it('overrides object-position only for cards with a custom imagePosition, keeping cover for the rest', async () => {
      const wrapper = await mountCards(twoCardsOneCustomPosition)
      const images = wrapper.findAll('img.kb-card__image')

      expect(images[0]!.attributes('style')).toBeUndefined()
      expect(images[1]!.attributes('style')).toContain('object-position: center 85%')
    })
  })

  describe('with more cards than fit (carousel loop active)', () => {
    it('renders head/tail clone slides around the real cards', async () => {
      const wrapper = await mountCards(fourCards)

      // jsdom width (1024) => itemsPerView = 2 => 2 head clones + 4 real + 2 tail clones
      expect(wrapper.findAll('.kb-therapies__slide')).toHaveLength(8)
      expect(wrapper.findAll('.kb-card')).toHaveLength(8)
    })

    it('shows navigation arrows and dots (one per real card)', async () => {
      const wrapper = await mountCards(fourCards)

      expect(wrapper.find('.kb-therapies__arrow--prev').exists()).toBe(true)
      expect(wrapper.find('.kb-therapies__arrow--next').exists()).toBe(true)
      expect(wrapper.findAll('.kb-therapies__dot')).toHaveLength(4)
    })

    it('marks clone slides as aria-hidden and inert, keeping real ones interactive', async () => {
      const wrapper = await mountCards(fourCards)
      const slides = wrapper.findAll('.kb-therapies__slide')

      // 2 clones al inicio, luego los 4 reales: el índice 2 es el primer real.
      expect(slides[0]!.attributes('aria-hidden')).toBe('true')
      expect(slides[2]!.attributes('aria-hidden')).toBeUndefined()
    })

    it('advances one card forward when clicking the next arrow', async () => {
      const wrapper = await mountCards(fourCards)
      const trackBefore = wrapper.find('.kb-therapies__track').attributes('style')

      await wrapper.find('.kb-therapies__arrow--next').trigger('click')

      const trackAfter = wrapper.find('.kb-therapies__track').attributes('style')
      expect(trackAfter).not.toBe(trackBefore)
    })

    it('moves back when clicking the previous arrow', async () => {
      const wrapper = await mountCards(fourCards)
      await wrapper.find('.kb-therapies__arrow--next').trigger('click')
      const afterNext = wrapper.find('.kb-therapies__track').attributes('style')

      await wrapper.find('.kb-therapies__arrow--prev').trigger('click')
      const afterPrev = wrapper.find('.kb-therapies__track').attributes('style')

      expect(afterPrev).not.toBe(afterNext)
    })

    it('jumps to the clicked dot and marks it active', async () => {
      const wrapper = await mountCards(fourCards)
      const dots = wrapper.findAll('.kb-therapies__dot')

      await dots[2]!.trigger('click')

      expect(dots[2]!.classes()).toContain('is-active')
    })

    it('only snaps back to the start once its own transform transition ends, not a bubbled one from a card', async () => {
      // jsdom no ejecuta transiciones CSS reales: hay que disparar el evento
      // "transitionend" a mano para reproducir el wrap-around infinito.
      const wrapper = await mountCards(fourCards)
      const track = wrapper.find('.kb-therapies__track')

      // itemsPerView=2 (ancho jsdom) => índice real 2..5, el índice 6 entra
      // en los clones de cola (equivalentes a las 2 primeras tarjetas).
      await wrapper.find('.kb-therapies__arrow--next').trigger('click') // 3
      await wrapper.find('.kb-therapies__arrow--next').trigger('click') // 4
      await wrapper.find('.kb-therapies__arrow--next').trigger('click') // 5
      await wrapper.find('.kb-therapies__arrow--next').trigger('click') // 6 (límite)

      expect(track.attributes('style')).toContain('translateX(-300%)')

      // Un "transitionend" que burbujea desde una tarjeta hija (p. ej. su
      // propio hover) no debe recortar el slide a mitad de animación.
      const card = wrapper.find('.kb-card').element
      card.dispatchEvent(
        new TransitionEvent('transitionend', { propertyName: 'transform', bubbles: true }),
      )
      await nextTick()
      expect(track.attributes('style')).toContain('translateX(-300%)')

      // El "transitionend" real del propio track sí debe disparar el snap
      // instantáneo (sin transición) de vuelta al principio.
      track.element.dispatchEvent(
        new TransitionEvent('transitionend', { propertyName: 'transform', bubbles: true }),
      )
      await nextTick()
      expect(track.attributes('style')).toContain('translateX(-100%)')
      expect(track.attributes('style')).toContain('transition: none')
    })

    it('auto-advances on a timer', async () => {
      vi.useFakeTimers()
      const wrapper = await mountCards(fourCards)
      // Asienta el doble requestAnimationFrame del ajuste inicial de
      // itemsPerView (también controlado por los timers falsos) antes de
      // tomar la referencia "before".
      await vi.advanceTimersByTimeAsync(50)
      const before = wrapper.find('.kb-therapies__track').attributes('style')

      await vi.advanceTimersByTimeAsync(4600)

      const after = wrapper.find('.kb-therapies__track').attributes('style')
      expect(after).not.toBe(before)
    })

    it('pauses auto-advance while the mouse is over the carousel', async () => {
      vi.useFakeTimers()
      const wrapper = await mountCards(fourCards)
      await vi.advanceTimersByTimeAsync(50)
      await wrapper.find('.kb-therapies__carousel').trigger('mouseenter')
      const before = wrapper.find('.kb-therapies__track').attributes('style')

      await vi.advanceTimersByTimeAsync(4600)

      const after = wrapper.find('.kb-therapies__track').attributes('style')
      expect(after).toBe(before)
    })

    it('pauses and resumes auto-advance via the play/pause button', async () => {
      vi.useFakeTimers()
      const wrapper = await mountCards(fourCards)
      await vi.advanceTimersByTimeAsync(50)

      await wrapper.find('.kb-therapies__playpause').trigger('click')
      const pausedStyle = wrapper.find('.kb-therapies__track').attributes('style')
      await vi.advanceTimersByTimeAsync(4600)
      expect(wrapper.find('.kb-therapies__track').attributes('style')).toBe(pausedStyle)

      await wrapper.find('.kb-therapies__playpause').trigger('click')
      await vi.advanceTimersByTimeAsync(4600)
      expect(wrapper.find('.kb-therapies__track').attributes('style')).not.toBe(pausedStyle)
    })

    it('does not auto-advance when the user prefers reduced motion', async () => {
      mockMatchMedia(true)
      vi.useFakeTimers()
      const wrapper = await mountCards(fourCards)
      await vi.advanceTimersByTimeAsync(50)
      const before = wrapper.find('.kb-therapies__track').attributes('style')

      await vi.advanceTimersByTimeAsync(10000)

      const after = wrapper.find('.kb-therapies__track').attributes('style')
      expect(after).toBe(before)
    })
  })
})
