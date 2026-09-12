import { describe, expect, it } from 'vitest'

import type { OrderStatus } from '../types'

import { statusLabel, statusRowTone, statusVariant } from './status'

const STATUSES: OrderStatus[] = ['pending', 'paid', 'cancelled']

describe('statusVariant', () => {
  it('paints a paid order with the success tone', () => {
    expect(statusVariant('paid')).toBe('success')
  })

  it('paints a cancelled order with the error tone', () => {
    expect(statusVariant('cancelled')).toBe('error')
  })

  // Pendiente es el estado de arranque y el más frecuente: en rojo o en verde
  // teñiría de alarma —o de éxito— una tabla entera que todavía no dice nada.
  it('leaves a pending order neutral', () => {
    expect(statusVariant('pending')).toBe('neutral')
  })

  it('resolves a tone for every status the backend accepts', () => {
    STATUSES.forEach((status) => {
      expect(statusVariant(status)).toBeDefined()
    })
  })
})

describe('statusLabel', () => {
  it('translates the status to what the operator reads', () => {
    expect(statusLabel('paid')).toBe('Pagada')
  })

  it('has a label for every status', () => {
    STATUSES.forEach((status) => {
      expect(statusLabel(status)).not.toBe('')
    })
  })
})

describe('statusRowTone', () => {
  it('highlights a cancelled order', () => {
    expect(statusRowTone('cancelled')).toBe('critical')
  })

  // Contraprueba: si todo fuera crítico, destacar dejaría de significar algo.
  it('leaves every other status untouched', () => {
    expect(statusRowTone('pending')).toBe('default')
    expect(statusRowTone('paid')).toBe('default')
  })
})
