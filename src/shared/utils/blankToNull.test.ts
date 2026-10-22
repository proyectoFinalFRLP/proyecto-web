import { describe, expect, it } from 'vitest'

import { blankToNull } from './blankToNull'

describe('blankToNull', () => {
  it('trims the text it keeps', () => {
    expect(blankToNull('  La Plata ')).toBe('La Plata')
  })

  // La provincia se valida contra una lista, y `""` no está en ella.
  it('turns an empty or blank text into null', () => {
    expect(blankToNull('')).toBeNull()
    expect(blankToNull('   ')).toBeNull()
  })

  // Del lado de la lectura, una API anterior puede no mandar el campo.
  it('reads a missing value as null', () => {
    expect(blankToNull(null)).toBeNull()
    expect(blankToNull(undefined)).toBeNull()
  })
})
