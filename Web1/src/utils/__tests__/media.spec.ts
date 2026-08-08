import { describe, it, expect } from 'vitest'
import { getMediaUrl } from '../media'
import type { WordPressMedia } from '../../types/api'

function makeMedia(overrides: Partial<WordPressMedia> = {}): WordPressMedia {
  return {
    id: 1,
    source_url: 'https://example.com/original.jpg',
    media_details: {
      width: 2000,
      height: 1500,
      sizes: {
        medium: { source_url: 'https://example.com/medium.jpg', width: 300, height: 225 },
        medium_large: { source_url: 'https://example.com/medium_large.jpg', width: 768, height: 576 },
        large: { source_url: 'https://example.com/large.jpg', width: 1024, height: 768 },
      },
    },
    ...overrides,
  }
}

describe('getMediaUrl', () => {
  it('returns undefined when media is null or undefined', () => {
    expect(getMediaUrl(null)).toBeUndefined()
    expect(getMediaUrl(undefined)).toBeUndefined()
  })

  it('defaults to the "large" variant when no size is given', () => {
    expect(getMediaUrl(makeMedia())).toBe('https://example.com/large.jpg')
  })

  it('returns the requested variant when it exists', () => {
    expect(getMediaUrl(makeMedia(), 'medium')).toBe('https://example.com/medium.jpg')
    expect(getMediaUrl(makeMedia(), 'medium_large')).toBe('https://example.com/medium_large.jpg')
  })

  it('falls back to the original source_url when the requested size is missing', () => {
    const media = makeMedia({
      media_details: { width: 2000, height: 1500, sizes: {} },
    })
    expect(getMediaUrl(media, 'medium')).toBe('https://example.com/original.jpg')
  })

  it('falls back to the original source_url when media_details is missing entirely', () => {
    const media = makeMedia({ media_details: undefined })
    expect(getMediaUrl(media, 'large')).toBe('https://example.com/original.jpg')
  })
})
