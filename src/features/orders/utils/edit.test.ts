import { describe, expect, it } from 'vitest'

import type { OrderDetail, ProductStockByWarehouse } from '../types'

import {
  editSubtotal,
  isLocked,
  isQuantityValid,
  linesChanged,
  stockShortfalls,
  toEditLines,
  toUpdatePayload,
} from './edit'
import type { EditHeader, EditLine } from './edit'

function line(overrides: Partial<EditLine> = {}): EditLine {
  return {
    key: 'line-1',
    id: 1,
    productId: 12,
    sku: 'PRO-8812-A',
    name: 'Nodo sensor industrial v3',
    unitPrice: 120000,
    quantity: 8,
    originalQuantity: 8,
    warehouseId: 3,
    ...overrides,
  }
}

function added(overrides: Partial<EditLine> = {}): EditLine {
  return line({ key: 'new-40', id: null, productId: 40, originalQuantity: 0, ...overrides })
}

const HEADER: EditHeader = {
  customerName: ' Global Tech ',
  customerDocument: '30-71234567-8 ',
  status: 'paid',
  address: 'Av. Corrientes 3247 ',
  city: ' CABA',
  province: 'Ciudad Autónoma de Buenos Aires',
  zipCode: '1193',
}

describe('toEditLines', () => {
  it('starts each line with the quantity it was read with', () => {
    const order = {
      lines: [
        {
          id: 5,
          productId: 12,
          sku: 'PRO-8812-A',
          productName: 'Nodo',
          quantity: 8,
          unitPrice: 120000,
          warehouseId: 3,
        },
      ],
    } as OrderDetail

    expect(toEditLines(order)).toEqual([
      expect.objectContaining({ key: 'line-5', id: 5, quantity: 8, originalQuantity: 8 }),
    ])
  })
})

describe('isLocked', () => {
  it('locks a line of the order that does not record its warehouse', () => {
    expect(isLocked(line({ warehouseId: null }))).toBe(true)
  })

  it('does not lock a line that records it, nor a new one', () => {
    expect(isLocked(line())).toBe(false)
    expect(isLocked(added())).toBe(false)
  })
})

describe('isQuantityValid', () => {
  it('accepts whole units and rejects zero, fractions and a blank field', () => {
    expect([1, 12].every(isQuantityValid)).toBe(true)
    expect([0, 1.5, Number.NaN].some(isQuantityValid)).toBe(false)
  })
})

describe('stockShortfalls', () => {
  // 2 unidades libres del producto 12 en el depósito 3.
  const STOCKS: ProductStockByWarehouse[] = [
    { productId: 12, quantities: { 3: 2 } },
    { productId: 40, quantities: { 3: 5 } },
  ]

  it('lets a line grow as much as the free units of its warehouse', () => {
    expect(stockShortfalls([line({ quantity: 10 })], [], STOCKS)).toEqual([])
  })

  it('reports how many units the group is missing', () => {
    expect(stockShortfalls([line({ quantity: 11 })], [], STOCKS)).toEqual([
      expect.objectContaining({ sku: 'PRO-8812-A', warehouseId: 3, missing: 1, lines: 1 }),
    ])
  })

  it('never reports a line that goes down', () => {
    expect(stockShortfalls([line({ quantity: 1 })], [], [])).toEqual([])
  })

  // El mismo producto en el mismo depósito: lo que libera una línea lo puede
  // tomar la otra, igual que en el backend.
  it('counts the units another line of the same product gives back', () => {
    const lines = [
      line({ quantity: 12 }),
      line({ key: 'line-2', id: 2, quantity: 1, originalQuantity: 3 }),
    ]

    expect(stockShortfalls(lines, [], STOCKS)).toEqual([])
  })

  // El grupo es el que no entra, pero la línea que bajó no tiene la culpa ni
  // nada para corregir: marcarla mandaría a mirar la fila equivocada.
  it('blames only the lines that went up inside a group that does not fit', () => {
    const lines = [
      line({ quantity: 14 }),
      line({ key: 'line-2', id: 2, quantity: 1, originalQuantity: 3 }),
    ]

    expect(stockShortfalls(lines, [], STOCKS)).toEqual([
      expect.objectContaining({ missing: 2, lines: 2, lineKeys: ['line-1'] }),
    ])
  })

  it('counts the units of a removed line as given back', () => {
    const removed = [line({ key: 'line-2', id: 2, originalQuantity: 4 })]

    expect(stockShortfalls([line({ quantity: 14 })], removed, STOCKS)).toEqual([])
  })

  it('checks a new line against the whole free stock', () => {
    expect(stockShortfalls([added({ quantity: 6 })], [], STOCKS)).toEqual([
      expect.objectContaining({ sku: 'PRO-8812-A', missing: 1, lineKeys: ['new-40'] }),
    ])
  })

  it('does not guess when the stock of the product has not loaded', () => {
    expect(stockShortfalls([line({ quantity: 99 })], [], [])).toEqual([])
  })
})

describe('linesChanged', () => {
  const original = [line(), line({ key: 'line-2', id: 2 })]

  it('is false when nothing moved', () => {
    expect(linesChanged(original, [...original])).toBe(false)
  })

  it('is true when a quantity changed, a line left or a line came in', () => {
    expect(linesChanged(original, [line({ quantity: 9 }), original[1]])).toBe(true)
    expect(linesChanged(original, [original[0]])).toBe(true)
    expect(linesChanged(original, [...original, added()])).toBe(true)
  })
})

describe('editSubtotal', () => {
  it('adds up the lines as they are being edited, skipping a blank quantity', () => {
    expect(editSubtotal([line({ quantity: 2 }), added({ quantity: Number.NaN })])).toBe(240000)
  })
})

describe('toUpdatePayload', () => {
  it('sends only the header when the lines did not change', () => {
    const payload = toUpdatePayload(HEADER, [line()], false)

    expect(payload.order).not.toHaveProperty('items')
    expect(payload.order).toMatchObject({
      customer_name: 'Global Tech',
      customer_document: '30-71234567-8',
      customer_address: 'Av. Corrientes 3247',
      customer_city: 'CABA',
      customer_province: 'Ciudad Autónoma de Buenos Aires',
      customer_zip_code: '1193',
      status: 'paid',
    })
  })

  it('sends every line when they changed: id and quantity for the kept ones', () => {
    const payload = toUpdatePayload(HEADER, [line({ quantity: 5 }), added({ quantity: 2 })], true)

    expect(payload.order.items).toEqual([
      { id: 1, quantity: 5 },
      { product_id: 40, quantity: 2, unit_price: 120000, warehouse_id: 3 },
    ])
  })

  it('refuses to send a new line without a warehouse instead of inventing one', () => {
    expect(() => toUpdatePayload(HEADER, [added({ warehouseId: null })], true)).toThrow(
      /has no warehouse/,
    )
  })
})
