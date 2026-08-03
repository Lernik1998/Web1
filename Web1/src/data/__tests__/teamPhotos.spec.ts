import { describe, it, expect } from 'vitest'
import { getTeamPhoto } from '../teamPhotos'

describe('getTeamPhoto', () => {
  it('returns the photo for a known slug', () => {
    const photo = getTeamPhoto('maria-b-kanbouri')
    expect(photo).toEqual({ image: '/images/maria-kanbouri.jpg' })
  })

  it('returns a photo with imageScale/imagePosition when defined', () => {
    const photo = getTeamPhoto('ester-pinedo-gil')
    expect(photo).toEqual({
      image: '/images/ester-pinedo.png',
      imageScale: 1.4,
      imagePosition: 'center 30%',
    })
  })

  it('strips a numeric duplicate suffix ("-2") before looking up the photo', () => {
    const photo = getTeamPhoto('ester-pinedo-gil-2')
    expect(photo).toEqual(getTeamPhoto('ester-pinedo-gil'))
  })

  it('strips higher numeric suffixes too (e.g. "-3")', () => {
    const photo = getTeamPhoto('beatriz-donet-3')
    expect(photo).toEqual(getTeamPhoto('beatriz-donet'))
  })

  it('returns null for an unknown slug', () => {
    expect(getTeamPhoto('nadie-existe')).toBeNull()
  })

  it('returns null for an unknown slug even with a numeric suffix', () => {
    expect(getTeamPhoto('nadie-existe-2')).toBeNull()
  })
})
