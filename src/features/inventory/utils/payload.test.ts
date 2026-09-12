import { describe, expect, it } from 'vitest'

import type { CreateProductFormData } from '../components/CreateProductModal/CreateProductModal.schema'
import type { EditProductFormData } from '../components/EditProductModal/EditProductModal.schema'
import type { Product } from '../types'

import { buildCreatePayload, buildUpdatePayload } from './payload'

function createForm(overrides: Partial<CreateProductFormData> = {}): CreateProductFormData {
  return {
    name: 'Cable UTP Cat6',
    sku: 'CAB-6-305',
    weight: 12.4,
    length: 45,
    width: 30,
    height: 20,
    stocks: [{ warehouseId: 1, quantity: 10 }],
    ...overrides,
  }
}

function editForm(overrides: Partial<EditProductFormData> = {}): EditProductFormData {
  return {
    name: 'Cable UTP Cat6',
    weight: 12.4,
    length: 45,
    width: 30,
    height: 20,
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
    weight: 12.4,
    dimensions: '45x30x20',
    stocks: [
      {
        warehouseId: 1,
        quantity: 10,
        warehouse: { id: 1, name: 'CD Ezeiza', address: 'Autopista Riccheri km 33' },
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
        weight: 12.4,
        dimensions: '45x30x20',
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

  it('sends description as an explicit null, since the form has no such field', () => {
    expect(buildCreatePayload(createForm()).product.description).toBeNull()
  })

  it('sends null dimensions when the user loaded no measurements', () => {
    const payload = buildCreatePayload(createForm({ length: 0, width: 0, height: 0 }))

    expect(payload.product.dimensions).toBeNull()
  })
})

describe('buildUpdatePayload', () => {
  it('translates the form into the body the API expects', () => {
    expect(buildUpdatePayload(product(), editForm())).toEqual({
      product: {
        name: 'Cable UTP Cat6',
        description: 'Rollo de 305 metros',
        weight: 12.4,
        dimensions: '45x30x20',
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
          warehouse: { id: 2, name: 'CD Córdoba', address: 'Ruta 9 km 695' },
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

  // Si el formulario no supo mostrar la medida guardada, borrarla al guardar
  // sería perder un dato que el usuario nunca vio ni decidió tocar.
  it('keeps a stored measurement the form could not parse', () => {
    const stored = product({ dimensions: 'grande' })
    const empty = editForm({ length: 0, width: 0, height: 0 })

    expect(buildUpdatePayload(stored, empty).product.dimensions).toBe('grande')
  })

  it('clears the measurement when the stored one was in the canonical format', () => {
    const empty = editForm({ length: 0, width: 0, height: 0 })

    expect(buildUpdatePayload(product(), empty).product.dimensions).toBeNull()
  })

  it('overwrites an unparseable measurement once the user loads real ones', () => {
    const stored = product({ dimensions: 'grande' })

    expect(buildUpdatePayload(stored, editForm()).product.dimensions).toBe('45x30x20')
  })
})
