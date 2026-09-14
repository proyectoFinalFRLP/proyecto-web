import { describe, expect, it } from 'vitest'

import type { StockStatus } from '../types'

import { stockLabel, stockRowTone, stockVariant } from './stockStatus'

const STATUSES: StockStatus[] = ['available', 'low', 'out_of_stock']

describe('stockVariant', () => {
  it('paints an available product with the success tone', () => {
    expect(stockVariant('available')).toBe('success')
  })

  // Ámbar y no rojo: hay mercadería, sólo que poca. El rojo queda para el cero,
  // que es lo único que impide vender.
  it('paints low stock with the warning tone', () => {
    expect(stockVariant('low')).toBe('warning')
  })

  it('paints an empty product with the error tone', () => {
    expect(stockVariant('out_of_stock')).toBe('error')
  })

  it('resolves a tone for every status the backend sends', () => {
    STATUSES.forEach((status) => {
      expect(stockVariant(status)).toBeDefined()
    })
  })
})

describe('stockLabel', () => {
  it('translates the status to what the operator reads', () => {
    expect(stockLabel('out_of_stock')).toBe('Sin stock')
  })

  it('has a label for every status', () => {
    STATUSES.forEach((status) => {
      expect(stockLabel(status)).not.toBe('')
    })
  })
})

describe('stockRowTone', () => {
  it('highlights only what is at zero', () => {
    expect(stockRowTone('out_of_stock')).toBe('critical')
  })

  // Contraprueba: resaltar también el stock bajo teñiría media tabla y el
  // resalte dejaría de significar algo.
  it('leaves low stock and available rows untouched', () => {
    expect(stockRowTone('low')).toBe('default')
    expect(stockRowTone('available')).toBe('default')
  })
})
