import { describe, expect, it } from 'vitest'

import { formatDimensions, isParseableDimensions, parseDimensions } from './dimensions'

describe('parseDimensions', () => {
  it('opens the canonical string into its three axes', () => {
    expect(parseDimensions('45x30x20')).toEqual({ length: 45, width: 30, height: 20 })
  })

  it('accepts decimals and spaces around each axis', () => {
    expect(parseDimensions(' 45.5 x 30 x 20.25 ')).toEqual({
      length: 45.5,
      width: 30,
      height: 20.25,
    })
  })

  it('accepts an uppercase separator', () => {
    expect(parseDimensions('45X30X20')).toEqual({ length: 45, width: 30, height: 20 })
  })

  // La columna es texto libre en la base y tiene cargas viejas. Nada de esto
  // puede romper el modal: el usuario ve los campos en cero y carga las medidas.
  it.each([
    ['a free-text load', 'grande'],
    ['two axes only', '45x30'],
    ['four axes', '45x30x20x10'],
    ['a negative axis', '45x-30x20'],
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
  ])('falls back to zeroes for %s', (_name, value) => {
    expect(parseDimensions(value)).toEqual({ length: 0, width: 0, height: 0 })
  })
})

describe('isParseableDimensions', () => {
  it('is true for the canonical format', () => {
    expect(isParseableDimensions('45x30x20')).toBe(true)
  })

  // Es la diferencia que le permite al submit conservar una carga vieja en vez
  // de pisarla con null: "no se entiende" no es lo mismo que "es cero".
  it('is false for a load that parseDimensions turns into zeroes', () => {
    expect(isParseableDimensions('grande')).toBe(false)
    expect(parseDimensions('grande')).toEqual({ length: 0, width: 0, height: 0 })
  })

  it('is true for a genuine zero, which is a load and not an absence', () => {
    expect(isParseableDimensions('0x0x0')).toBe(true)
  })
})

describe('formatDimensions', () => {
  it('serializes the three axes into the canonical string', () => {
    expect(formatDimensions({ length: 45, width: 30, height: 20 })).toBe('45x30x20')
  })

  it('keeps decimals', () => {
    expect(formatDimensions({ length: 45.5, width: 30, height: 20.25 })).toBe('45.5x30x20.25')
  })

  // Un producto sin medidas deja la columna vacía en vez de guardar un "0x0x0"
  // que después habría que interpretar como "sin dato".
  it('returns null when the three axes are zero', () => {
    expect(formatDimensions({ length: 0, width: 0, height: 0 })).toBeNull()
  })

  it('does not return null when only some axes are zero', () => {
    expect(formatDimensions({ length: 45, width: 0, height: 0 })).toBe('45x0x0')
  })

  it('round-trips the canonical format', () => {
    expect(formatDimensions(parseDimensions('45x30x20'))).toBe('45x30x20')
  })
})
