import { describe, expect, it } from 'vitest'

import type { OrderDetail, OrderLine } from '../types'

import { lineSubtotal, paymentSummary, totalUnits } from './payment'

function line(unitPrice: number, quantity: number): OrderLine {
  return {
    id: unitPrice + quantity,
    productId: 1,
    sku: 'PRO-1',
    productName: 'Producto',
    quantity,
    unitPrice,
  }
}

function order(overrides: Partial<OrderDetail> = {}): OrderDetail {
  return {
    id: 8829,
    externalOrderId: null,
    customerName: 'Global Tech Solutions S.A.',
    customerDocument: null,
    customerAddress: null,
    customerZipCode: null,
    status: 'paid',
    totalAmount: 1420000,
    lines: [line(120000, 8), line(150000, 2), line(3313, 57)],
    createdAt: '2026-08-12T12:42:00Z',
    ...overrides,
  }
}

describe('lineSubtotal', () => {
  it('multiplies the billed price by the quantity', () => {
    expect(lineSubtotal(line(3313, 57))).toBe(188841)
  })

  it('does not leak floating point noise', () => {
    expect(lineSubtotal(line(0.1, 3))).toBe(0.3)
  })
})

describe('totalUnits', () => {
  it('adds the quantity of every line', () => {
    expect(totalUnits(order().lines)).toBe(67)
  })

  it('is zero for an order without lines', () => {
    expect(totalUnits([])).toBe(0)
  })
})

describe('paymentSummary', () => {
  it('adds the quoted shipping cost to the products', () => {
    expect(paymentSummary(order(), 58300)).toEqual({
      subtotal: 1420000,
      shipping: 58300,
      total: 1478300,
    })
  })

  // Un envío sin cotizar no cuesta 0: queda pendiente y el total es lo que se sabe.
  it('keeps the shipping pending instead of counting it as zero', () => {
    expect(paymentSummary(order(), null)).toEqual({
      subtotal: 1420000,
      shipping: null,
      total: 1420000,
    })
  })

  // El subtotal es lo facturado (TESIS-114), no lo que darían las líneas hoy.
  it('trusts the persisted total over the sum of the lines', () => {
    expect(paymentSummary(order({ totalAmount: 1000 }), null).subtotal).toBe(1000)
  })

  it('adds up the lines for an order that predates the persisted total', () => {
    expect(paymentSummary(order({ totalAmount: null }), null).subtotal).toBe(1448841)
  })

  it('adds cents without floating point noise', () => {
    expect(paymentSummary(order({ totalAmount: 0.1 }), 0.2).total).toBe(0.3)
  })
})
