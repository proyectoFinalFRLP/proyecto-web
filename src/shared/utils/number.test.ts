import { describe, expect, it } from 'vitest'

import { formatDecimal, formatInteger, formatMoney, formatRoundMoney } from './number'

// Estos ejemplos venían repartidos en `inventory/utils/format.test.ts`,
// `orders/utils/format.test.ts` y `reports/utils/format.test.ts`, uno por cada
// copia del mismo formateador. Al quedar una sola implementación (TESIS-166),
// quedan en un solo lugar y valen para todas las pantallas.

describe('formatInteger', () => {
  it('uses a thousands separator, as the design writes it', () => {
    expect(formatInteger(4280)).toBe('4.280')
  })

  it('has no separator below one thousand', () => {
    expect(formatInteger(280)).toBe('280')
  })

  it('still formats a zero, which is a number like any other', () => {
    expect(formatInteger(0)).toBe('0')
  })

  // Lo que la API manda es lo que la pantalla imprime, y si una versión vieja
  // no manda un campo que la pantalla ya lee, `Intl` escribe `NaN`. La guarda
  // existía en una sola de las copias; ahora la heredan todas.
  it('says there is no data instead of printing NaN', () => {
    expect(formatInteger(undefined as unknown as number)).toBe('—')
    expect(formatInteger(Number.NaN)).toBe('—')
    expect(formatInteger(Number.POSITIVE_INFINITY)).toBe('—')
  })
})

describe('formatDecimal', () => {
  it('formats with a comma decimal separator', () => {
    expect(formatDecimal(1.45)).toBe('1,45')
  })

  it('pads to two decimals', () => {
    expect(formatDecimal(2)).toBe('2,00')
  })

  it('says there is no data instead of printing NaN', () => {
    expect(formatDecimal(Number.NaN)).toBe('—')
  })
})

describe('formatMoney', () => {
  it('groups thousands with a dot', () => {
    expect(formatMoney(1478300)).toContain('1.478.300')
  })

  /**
   * El diseño muestra los importes sin decimales, pero donde se usa es plata
   * facturada: redondear en pantalla muestra un número que no es el de la
   * orden. Este ejemplo fija la decisión de apartarse del mock.
   */
  it('keeps the cents instead of rounding them away', () => {
    expect(formatMoney(1478300.49)).toContain('1.478.300,49')
  })

  it('always shows two decimals, even on a round amount', () => {
    expect(formatMoney(1000)).toContain('1.000,00')
  })

  it('formats zero without falling back to an empty cell', () => {
    expect(formatMoney(0)).toContain('0,00')
  })

  it('says there is no data instead of printing NaN', () => {
    expect(formatMoney(Number.NaN)).toBe('—')
  })
})

describe('formatRoundMoney', () => {
  // El costo del envío se lee de un vistazo en una tabla: el centavo no cambia
  // ninguna decisión y la columna gana en lectura.
  it('drops the cents', () => {
    expect(formatRoundMoney(58300)).toContain('58.300')
    expect(formatRoundMoney(58300)).not.toContain(',')
  })

  it('rounds instead of truncating', () => {
    expect(formatRoundMoney(58300.6)).toContain('58.301')
  })

  it('says there is no data instead of printing NaN', () => {
    expect(formatRoundMoney(Number.NaN)).toBe('—')
  })
})
