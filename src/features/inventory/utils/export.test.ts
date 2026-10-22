import { describe, expect, it } from 'vitest'

import type { Product } from '../types'

import { buildProductCsv } from './export'

const PRODUCT: Product = {
  id: 7,
  sku: 'CAB-6-305',
  name: 'Cable UTP Cat6',
  description: 'Rollo de 305 metros',
  category: 'Cabling',
  packaging: null,
  technicalStandard: 'IRAM 4200',
  weight: 12.4,
  lengthCm: 45,
  widthCm: 30,
  heightCm: null,
  committed: 4,
  onHand: 44,
  availableToPromise: 40,
  inTransit: 7,
  totalStock: 40,
  stockStatus: 'low',
  lowStockThreshold: 100,
  inTransitQuantity: 7,
  inTransitByWarehouse: [{ warehouseId: 2, name: 'CD Córdoba', quantity: 7 }],
  committedByWarehouse: [{ warehouseId: 1, name: 'CD Ezeiza', quantity: 4 }],
  stocks: [
    {
      warehouseId: 1,
      quantity: 40,
      committed: 4,
      warehouse: { id: 1, name: 'CD Ezeiza', address: 'Autopista Riccheri km 33', capacity: null },
      stockStatus: 'low',
    },
  ],
  updatedAt: '2026-08-30T12:00:00.000Z',
  version: null,
}

/** El valor de la fila que arranca con este rótulo. */
function valueOf(rows: unknown[][], label: string) {
  return rows.find((row) => row[0] === label)?.[1]
}

describe('buildProductCsv', () => {
  it('writes the record of the product, one label and value per row', () => {
    const rows = buildProductCsv(PRODUCT)

    expect(rows[0]).toEqual(['Ficha del producto'])
    expect(valueOf(rows, 'SKU')).toBe('CAB-6-305')
    expect(valueOf(rows, 'Descripción')).toBe('Rollo de 305 metros')
    expect(valueOf(rows, 'Norma técnica')).toBe('IRAM 4200')
    expect(valueOf(rows, 'Estado')).toBe('Stock bajo')
  })

  // Los números van crudos: son para hacer cuentas en la planilla.
  it('writes the numbers raw, with their unit in the label', () => {
    const rows = buildProductCsv(PRODUCT)

    expect(valueOf(rows, 'Peso unitario (kg)')).toBe(12.4)
    expect(valueOf(rows, 'En depósito (unidades)')).toBe(44)
    expect(valueOf(rows, 'Disponible para prometer (unidades)')).toBe(40)
  })

  // En la planilla un «—» sería texto: lo que falta es una celda vacía.
  it('leaves empty what the product does not have loaded', () => {
    const rows = buildProductCsv(PRODUCT)

    expect(valueOf(rows, 'Empaque')).toBeNull()
    expect(valueOf(rows, 'Alto (cm)')).toBeNull()
  })

  // Las mismas filas que la tabla: también el depósito que sólo espera unidades.
  it('writes the stock of each warehouse, the incoming ones included', () => {
    const rows = buildProductCsv(PRODUCT)
    const start = rows.findIndex((row) => row[0] === 'Distribución por depósito')

    expect(rows.slice(start + 1)).toEqual([
      ['Depósito', 'Dirección', 'En depósito', 'Comprometido', 'En tránsito', 'Estado'],
      ['CD Ezeiza', 'Autopista Riccheri km 33', 44, 4, 0, 'Stock bajo'],
      ['CD Córdoba', null, 0, 0, 7, expect.any(String)],
    ])
  })
})
