import { describe, expect, it } from 'vitest'

import { carrierInitials } from './carrierInitials'

describe('carrierInitials', () => {
  it('takes the initial of each of the first two words', () => {
    expect(carrierInitials('Correo Argentino')).toBe('CA')
  })

  it('takes the first two letters of a single-word carrier', () => {
    expect(carrierInitials('Andreani')).toBe('AN')
  })

  it('uppercases whatever came in', () => {
    expect(carrierInitials('moova')).toBe('MO')
  })

  // Los nombres vienen de una tabla que carga el equipo a mano: un espacio de
  // más no puede producir un cuadrado con un espacio adentro.
  it('ignores surrounding and repeated whitespace', () => {
    expect(carrierInitials('  Correo   Argentino ')).toBe('CA')
  })

  it('does not break on a carrier named with a single letter', () => {
    expect(carrierInitials('A')).toBe('A')
  })
})
