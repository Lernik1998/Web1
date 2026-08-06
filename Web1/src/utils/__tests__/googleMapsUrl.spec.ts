import { describe, it, expect } from 'vitest'
import { parseStreetViewUrl, buildStreetViewEmbedSrc } from '../googleMapsUrl'

describe('parseStreetViewUrl', () => {
  it('returns null for an empty string', () => {
    expect(parseStreetViewUrl('')).toBeNull()
  })

  it('returns null for a shortened maps.app.goo.gl link (cannot be resolved client-side)', () => {
    expect(parseStreetViewUrl('https://maps.app.goo.gl/412Rb4nbLuqp145w8')).toBeNull()
  })

  it('returns null for a plain place URL with no Street View data', () => {
    expect(parseStreetViewUrl('https://www.google.com/maps/place/Somewhere/@40.1,2.2,15z')).toBeNull()
  })

  it('parses lat/lng/heading and converts tilt to pitch from a full Street View URL', () => {
    const url =
      'https://www.google.com/maps/place/C%2F+Sant+Josep/@38.8386523,0.1060985,3a,90y,91.12h,77.94t/data=!3m7!1e1'
    const result = parseStreetViewUrl(url)
    expect(result).toEqual({
      lat: 38.8386523,
      lng: 0.1060985,
      heading: 91.12,
      pitch: 90 - 77.94,
    })
  })

  it('handles negative coordinates', () => {
    const url = 'https://www.google.com/maps/@-33.45,-70.6667,3a,75y,45h,90t/data=!3m1!1e1'
    const result = parseStreetViewUrl(url)
    expect(result).toMatchObject({ lat: -33.45, lng: -70.6667, heading: 45, pitch: 0 })
  })
})

describe('buildStreetViewEmbedSrc', () => {
  it('builds a no-API-key Street View embed URL from the parsed params', () => {
    const src = buildStreetViewEmbedSrc({ lat: 38.83, lng: 0.1, heading: 95, pitch: 0 })
    expect(src).toBe('https://www.google.com/maps?layer=c&cbll=38.83,0.1&cbp=12,95,,0,0&output=svembed')
  })
})
