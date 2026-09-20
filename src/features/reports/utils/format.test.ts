import { describe, expect, it } from 'vitest'

import {
  formatCompact,
  formatCompactMoney,
  formatInteger,
  formatPercent,
  formatUnits,
} from './format'

describe('formatInteger', () => {
  it('separates thousands with a dot, as es-AR does', () => {
    expect(formatInteger(124592)).toBe('124.592')
  })

  it('drops the decimals of a count', () => {
    expect(formatInteger(4200.7)).toBe('4.201')
  })
})

describe('formatCompact', () => {
  it('leaves anything under a thousand as a plain integer', () => {
    expect(formatCompact(0)).toBe('0')
    expect(formatCompact(850)).toBe('850')
  })

  it('abbreviates thousands with k and a decimal comma', () => {
    expect(formatCompact(10000)).toBe('10k')
    expect(formatCompact(7500)).toBe('7,5k')
    expect(formatCompact(2500)).toBe('2,5k')
  })

  it('abbreviates millions with MM, the way the operation talks about pesos', () => {
    expect(formatCompact(4_200_000)).toBe('4,2 MM')
    expect(formatCompact(1_000_000)).toBe('1 MM')
  })

  // El eje y la tarjeta se leen de un vistazo: un segundo decimal es ruido.
  it('keeps one decimal at most', () => {
    expect(formatCompact(7_456)).toBe('7,5k')
    expect(formatCompact(4_248_000)).toBe('4,2 MM')
  })

  it('keeps the sign of a negative figure', () => {
    expect(formatCompact(-1500)).toBe('-1,5k')
  })
})

describe('formatCompactMoney', () => {
  it('glues the peso sign to the abbreviated figure, as in the design', () => {
    expect(formatCompactMoney(4_200_000)).toBe('$4,2 MM')
  })
})

describe('formatPercent', () => {
  it('shows one decimal with a comma', () => {
    expect(formatPercent(98.2)).toBe('98,2%')
  })

  it('does not pad a whole rate with a zero decimal', () => {
    expect(formatPercent(100)).toBe('100%')
  })
})

describe('formatUnits', () => {
  it('suffixes the count with the unit abbreviation', () => {
    expect(formatUnits(4200)).toBe('4.200 u')
  })
})
