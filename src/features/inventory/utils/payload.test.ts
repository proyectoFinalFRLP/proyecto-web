import { describe, expect, it } from 'vitest'

import type { CreateProductFormData } from '../components/CreateProductModal/CreateProductModal.schema'
import type { EditProductFormData } from '../components/EditProductModal/EditProductModal.schema'
import type { Product } from '../types'

import { buildCreatePayload, buildUpdatePayload } from './payload'

function createForm(overrides: Partial<CreateProductFormData> = {}): CreateProductFormData {
  return {
    name: 'Cable UTP Cat6',
    sku: 'CAB-6-305',
    category: '',
    weight: 12.4,
    length: 45,
    width: 30,
    height: 20,
    lowStockThreshold: 100,
    stocks: [{ warehouseId: 1, quantity: 10 }],
    ...overrides,
  }
}

function editForm(overrides: Partial<EditProductFormData> = {}): EditProductFormData {
  return {
    name: 'Cable UTP Cat6',
    category: 'Cabling',
    weight: 12.4,
    length: 45,
    width: 30,
    height: 20,
    lowStockThreshold: 100,
    stocks: [
      {
        warehouseId: 1,
        warehouseName: 'CD Ezeiza',
        warehouseAddress: 'Autopista Riccheri km 33',
        quantity: 10,
      },
    ],
    ...overrides,
  }
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 5,
    sku: 'CAB-6-305',
    name: 'Cable UTP Cat6',
    description: 'Rollo de 305 metros',
    category: null,
    packaging: null,
    technicalStandard: null,
    weight: 12.4,
    lengthCm: 45,
    widthCm: 30,
    heightCm: 20,
    committed: 0,
    onHand: 10,
    availableToPromise: 10,
    inTransit: 0,
    totalStock: 10,
    stockStatus: 'low',
    lowStockThreshold: 100,
    inTransitQuantity: 0,
    inTransitByWarehouse: [],
    committedByWarehouse: [],
    stocks: [
      {
        warehouseId: 1,
        quantity: 10,
        committed: 0,
        warehouse: {
          id: 1,
          name: 'CD Ezeiza',
          address: 'Autopista Riccheri km 33',
          capacity: null,
        },
        stockStatus: 'low',
      },
    ],
    updatedAt: '2026-08-30T12:00:00.000Z',
    // La versión del agregado que viaja como ETag (TESIS-101). No participa del
    // payload, pero `Product` la exige.
    version: '"abc"',
    ...overrides,
  }
}

describe('buildCreatePayload', () => {
  it('translates the form into the body the API expects', () => {
    expect(buildCreatePayload(createForm())).toEqual({
      product: {
        sku: 'CAB-6-305',
        name: 'Cable UTP Cat6',
        description: null,
        category: null,
        weight: 12.4,
        length_cm: 45,
        width_cm: 30,
        height_cm: 20,
        low_stock_threshold: 100,
        stocks: [{ warehouse_id: 1, quantity: 10 }],
      },
    })
  })

  // `stocks_attributes` es lo que dice la card TESIS-63, pero el controller lee
  // `params[:product][:stocks]`: con la otra clave el producto se crearía con
  // 201 y sin una sola unidad, en silencio.
  it('nests the stock under `stocks`, not `stocks_attributes`', () => {
    const payload = buildCreatePayload(createForm()) as unknown as Record<string, unknown>
    const nested = (payload.product ?? {}) as Record<string, unknown>

    expect(nested).toHaveProperty('stocks')
    expect(nested).not.toHaveProperty('stocks_attributes')
  })

  // TESIS-182: el mínimo que cargó el operador, no el default.
  it('sends the low stock threshold the operator typed', () => {
    expect(
      buildCreatePayload(createForm({ lowStockThreshold: 25 })).product.low_stock_threshold,
    ).toBe(25)
  })

  it('sends description as an explicit null, since the form has no such field', () => {
    expect(buildCreatePayload(createForm()).product.description).toBeNull()
  })

  // TESIS-185: tres números en centímetros, no el texto libre `dimensions`.
  it('sends the measurements as three numbers and no longer as text', () => {
    const payload = buildCreatePayload(createForm({ length: 16.5, width: 7.8, height: 0.9 }))

    expect(payload.product).toMatchObject({ length_cm: 16.5, width_cm: 7.8, height_cm: 0.9 })
    expect(payload.product).not.toHaveProperty('dimensions')
  })

  it('sends null measurements when the user loaded none', () => {
    const payload = buildCreatePayload(createForm({ length: null, width: null, height: null }))

    expect(payload.product).toMatchObject({ length_cm: null, width_cm: null, height_cm: null })
  })
})

describe('buildUpdatePayload', () => {
  it('translates the form into the body the API expects', () => {
    expect(buildUpdatePayload(product(), editForm())).toEqual({
      product: {
        name: 'Cable UTP Cat6',
        description: 'Rollo de 305 metros',
        category: 'Cabling',
        weight: 12.4,
        length_cm: 45,
        width_cm: 30,
        height_cm: 20,
        low_stock_threshold: 100,
        stocks: [{ warehouse_id: 1, quantity: 10 }],
      },
    })
  })

  // `Products::UpdateProduct` hace upsert por warehouse_id y nunca destruye:
  // omitir un depósito no lo desasigna, le deja la cantidad anterior.
  it('sends a removed warehouse explicitly at zero instead of omitting it', () => {
    const stored = product({
      stocks: [
        ...product().stocks,
        {
          warehouseId: 2,
          quantity: 40,
          committed: 0,
          warehouse: { id: 2, name: 'CD Córdoba', address: 'Ruta 9 km 695', capacity: null },
          stockStatus: 'low',
        },
      ],
    })

    expect(buildUpdatePayload(stored, editForm()).product.stocks).toEqual([
      { warehouse_id: 1, quantity: 10 },
      { warehouse_id: 2, quantity: 0 },
    ])
  })

  it('resends the description untouched, since the modal does not edit it', () => {
    const stored = product({ description: 'Texto que el modal no muestra' })

    expect(buildUpdatePayload(stored, editForm()).product.description).toBe(
      'Texto que el modal no muestra',
    )
  })

  // Vaciar un eje es borrarlo: viaja en `null` y no se conserva el anterior.
  it('clears a measurement the user emptied', () => {
    const payload = buildUpdatePayload(product(), editForm({ height: null }))

    expect(payload.product).toMatchObject({ length_cm: 45, width_cm: 30, height_cm: null })
    expect(payload.product).not.toHaveProperty('dimensions')
  })
})

describe('the category', () => {
  // Un `<select>` no tiene `null`: el formulario usa `''` para «sin categoría».
  it('sends no category as null', () => {
    expect(buildCreatePayload(createForm({ category: '' })).product.category).toBeNull()
  })

  it('sends the chosen category', () => {
    expect(buildCreatePayload(createForm({ category: 'Power' })).product.category).toBe('Power')
  })

  it('lets the edition clear the category', () => {
    expect(buildUpdatePayload(product(), editForm({ category: '' })).product.category).toBeNull()
  })
})
