import { describe, expect, it } from 'vitest'

import { formatLocation } from './location'

describe('formatLocation', () => {
  it('joins the address, the city and the province', () => {
    expect(
      formatLocation({ address: 'Av. 7 N° 1234', city: 'La Plata', province: 'Buenos Aires' }),
    ).toBe('Av. 7 N° 1234, La Plata, Buenos Aires')
  })

  // Los depósitos anteriores a TESIS-185 no tienen ni localidad ni provincia.
  it('shows only the address when the rest was never loaded', () => {
    expect(formatLocation({ address: 'Av. 7 N° 1234', city: null, province: null })).toBe(
      'Av. 7 N° 1234',
    )
  })

  it('skips a missing part without leaving a dangling comma', () => {
    expect(formatLocation({ address: 'Av. 7 N° 1234', city: null, province: 'Córdoba' })).toBe(
      'Av. 7 N° 1234, Córdoba',
    )
  })
})
