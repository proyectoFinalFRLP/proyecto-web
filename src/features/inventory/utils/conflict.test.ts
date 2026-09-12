import { describe, expect, it } from 'vitest'

import type { Product, ProductStock } from '../types'

import { describeConflict } from './conflict'
import type { ConflictLabels } from './conflict'

const LABELS: ConflictLabels = {
  name: 'Nombre',
  description: 'Descripción',
  weight: 'Peso',
  dimensions: 'Medidas',
  stockIn: (warehouse) => `Stock en ${warehouse}`,
}

function stock(warehouseId: number, quantity: number, warehouseName: string): ProductStock {
  return {
    warehouseId,
    quantity,
    warehouse: { id: warehouseId, name: warehouseName, address: 'Calle 1' },
  }
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 5,
    sku: 'CAB-6-305',
    name: 'Cable UTP Cat6',
    description: 'Rollo de 305 metros',
    weight: 12.4,
    dimensions: '45x30x20',
    stocks: [stock(1, 10, 'CD Ezeiza')],
    updatedAt: '2026-08-30T12:00:00.000Z',
    version: '"abc"',
    ...overrides,
  }
}

function texts(before: Product, after: Product): string[] {
  return describeConflict(before, after, LABELS).map((change) => change.text)
}

describe('describeConflict', () => {
  it('reports nothing when the two readings match', () => {
    expect(describeConflict(product(), product(), LABELS)).toEqual([])
  })

  it('names the field that changed', () => {
    expect(texts(product(), product({ name: 'Cable UTP Cat6A' }))).toEqual([
      'Nombre: Cable UTP Cat6 → Cable UTP Cat6A',
    ])
  })

  // El modal no edita `description`, pero el backend sí la digiere en el ETag
  // (`Catalog::ProductVersion#edited_fields`). Sin este caso, un conflicto
  // causado sólo por ese campo se mostraba como "no pudimos determinar qué
  // cambió" y "Guardar de todos modos" lo pisaba en silencio.
  it('reports a description change, even though the modal does not edit it', () => {
    expect(texts(product(), product({ description: 'Rollo de 100 metros' }))).toEqual([
      'Descripción: Rollo de 305 metros → Rollo de 100 metros',
    ])
  })

  it('shows an em dash when a text field went from or to null', () => {
    expect(texts(product({ description: null }), product())).toEqual([
      'Descripción: — → Rollo de 305 metros',
    ])
    expect(texts(product(), product({ dimensions: null }))).toEqual(['Medidas: 45x30x20 → —'])
  })

  it('reports weight and dimensions', () => {
    expect(texts(product(), product({ weight: 13, dimensions: '50x30x20' }))).toEqual([
      'Peso: 12.4 → 13',
      'Medidas: 45x30x20 → 50x30x20',
    ])
  })

  it('reports a stock quantity that moved', () => {
    const after = product({ stocks: [stock(1, 4, 'CD Ezeiza')] })

    expect(texts(product(), after)).toEqual(['Stock en CD Ezeiza: 10 → 4'])
  })

  it('ignores a warehouse whose quantity did not move', () => {
    const before = product({ stocks: [stock(1, 10, 'CD Ezeiza'), stock(2, 7, 'CD Córdoba')] })
    const after = product({ stocks: [stock(1, 10, 'CD Ezeiza'), stock(2, 3, 'CD Córdoba')] })

    expect(texts(before, after)).toEqual(['Stock en CD Córdoba: 7 → 3'])
  })

  it('shows an em dash for a warehouse that appeared between the two readings', () => {
    const after = product({ stocks: [stock(1, 10, 'CD Ezeiza'), stock(2, 5, 'CD Córdoba')] })

    expect(texts(product(), after)).toEqual(['Stock en CD Córdoba: — → 5'])
  })

  it('shows an em dash for a warehouse that disappeared', () => {
    const before = product({ stocks: [stock(1, 10, 'CD Ezeiza'), stock(2, 5, 'CD Córdoba')] })

    expect(texts(before, product())).toEqual(['Stock en CD Córdoba: 5 → —'])
  })

  // Antes el lado ausente caía en 0 y esto se leía "Stock en CD Córdoba: 0 → 0",
  // que no dice nada — y encima un depósito con cantidad 0 es un caso legítimo
  // y distinto.
  it('does not read as "0 → 0" when the warehouse that appeared has no units', () => {
    const after = product({ stocks: [stock(1, 10, 'CD Ezeiza'), stock(2, 0, 'CD Córdoba')] })

    expect(texts(product(), after)).toEqual(['Stock en CD Córdoba: — → 0'])
  })

  // Las claves alimentan el `key` de React en la lista del aviso: si dos
  // depósitos se llaman igual, el texto no sirve para distinguirlos.
  it('gives each change a key of its own, even when two warehouses share a name', () => {
    const before = product({ stocks: [stock(1, 10, 'Central'), stock(2, 10, 'Central')] })
    const after = product({ stocks: [stock(1, 4, 'Central'), stock(2, 6, 'Central')] })

    const ids = describeConflict(before, after, LABELS).map((change) => change.id)

    expect(ids).toEqual(['stock:1', 'stock:2'])
    expect(new Set(ids).size).toBe(2)
  })

  it('reports every change at once, with the fields before the stock', () => {
    const after = product({
      name: 'Cable UTP Cat6A',
      description: null,
      weight: 13,
      stocks: [stock(1, 4, 'CD Ezeiza')],
    })

    expect(texts(product(), after)).toEqual([
      'Nombre: Cable UTP Cat6 → Cable UTP Cat6A',
      'Descripción: Rollo de 305 metros → —',
      'Peso: 12.4 → 13',
      'Stock en CD Ezeiza: 10 → 4',
    ])
  })
})
