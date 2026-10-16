import { describe, expect, it } from 'vitest'

import { formatDimensions, hasDimensions, measureFromInput, toCentimeters } from './dimensions'

describe('toCentimeters', () => {
  it('keeps a positive measure as it comes', () => {
    expect(toCentimeters(16.5)).toBe(16.5)
  })

  // Un decimal de Rails viaja como string si el serializer no lo convierte.
  it('reads a decimal serialized as a string', () => {
    expect(toCentimeters('7.8')).toBe(7.8)
  })

  it.each([null, undefined, '', 0, -3, 'grande'])('treats %s as no measure', (value) => {
    expect(toCentimeters(value)).toBeNull()
  })
})

describe('hasDimensions', () => {
  it('is false when none of the three was loaded', () => {
    expect(hasDimensions({ lengthCm: null, widthCm: null, heightCm: null })).toBe(false)
  })

  it('is true with a single loaded axis', () => {
    expect(hasDimensions({ lengthCm: null, widthCm: 30, heightCm: null })).toBe(true)
  })
})

describe('formatDimensions', () => {
  it('writes length × width × height in centimeters, with comma decimals', () => {
    expect(formatDimensions({ lengthCm: 16.5, widthCm: 7.8, heightCm: 0.9 })).toBe(
      '16,5 × 7,8 × 0,9 cm',
    )
  })

  it('does not pad a whole measure', () => {
    expect(formatDimensions({ lengthCm: 45, widthCm: 30, heightCm: 20 })).toBe('45 × 30 × 20 cm')
  })

  it('says there is no data when no measure was loaded', () => {
    expect(formatDimensions({ lengthCm: null, widthCm: null, heightCm: null })).toBe('—')
  })

  it('marks only the missing axis', () => {
    expect(formatDimensions({ lengthCm: 45, widthCm: null, heightCm: 20 })).toBe('45 × — × 20 cm')
  })
})

describe('measureFromInput', () => {
  it('turns an empty input into null, since the measure is optional', () => {
    expect(measureFromInput('')).toBeNull()
  })

  it('reads what was typed as a number', () => {
    expect(measureFromInput('16.5')).toBe(16.5)
  })
})
