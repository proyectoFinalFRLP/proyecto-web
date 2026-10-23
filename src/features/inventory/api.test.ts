import type { AxiosResponse } from 'axios'
import { client } from 'shared/api/client'
import { describe, expect, it, vi } from 'vitest'

import { fetchProduct, fetchProductMappings, resyncProductMapping } from './api'

function respond(data: unknown, headers: Record<string, string> = {}): AxiosResponse {
  return { data, headers } as AxiosResponse
}

const PRODUCT = {
  id: 5,
  sku: 'MOU-001',
  name: 'Mouse inalámbrico',
  description: null,
  category: 'Electronics',
  packaging: null,
  technical_standard: null,
  weight: 0.1,
  length_cm: 16.5,
  width_cm: 7.8,
  height_cm: 0.9,
  total_stock: 10,
  stock_status: 'available',
  in_transit_quantity: 0,
  in_transit_by_warehouse: [],
  low_stock_threshold: 5,
  updated_at: '2026-10-16T12:00:00.000Z',
  committed_quantity: 0,
  on_hand_quantity: 10,
  available_to_promise: 10,
  committed_by_warehouse: [],
  stocks: [],
}

// TESIS-185: las medidas dejaron de ser el texto libre `dimensions`.
describe('fetchProduct · the measurements', () => {
  it('reads the three measurements in centimeters', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(respond(PRODUCT))

    expect(await fetchProduct(5)).toMatchObject({ lengthCm: 16.5, widthCm: 7.8, heightCm: 0.9 })
  })

  it('leaves as null a measurement nobody loaded', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(
      respond({ ...PRODUCT, length_cm: null, width_cm: null, height_cm: null }),
    )

    expect(await fetchProduct(5)).toMatchObject({ lengthCm: null, widthCm: null, heightCm: null })
  })

  // Un decimal de Rails se serializa como string si nadie lo convierte.
  it('reads a measurement that arrives as a decimal string', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(respond({ ...PRODUCT, width_cm: '7.8' }))

    expect((await fetchProduct(5)).widthCm).toBe(7.8)
  })

  it('no longer exposes the free text dimensions', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(respond({ ...PRODUCT, dimensions: '16x7x1' }))

    expect(await fetchProduct(5)).not.toHaveProperty('dimensions')
  })
})

const MAPPING = {
  id: 4,
  product_id: 5,
  company_integration_id: 10,
  service_name: 'Shopify',
  external_product_id: 'gid://shopify/ProductVariant/1',
}

// TESIS-177: el último intento de publicar el stock viaja con el vínculo.
describe('fetchProductMappings · the stock sync', () => {
  it('reads the last attempt and its failure reason', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(
      respond({
        data: [
          {
            ...MAPPING,
            last_synced_at: '2026-10-21T12:00:00Z',
            last_sync_error: 'location missing',
          },
        ],
      }),
    )

    const [mapping] = await fetchProductMappings(5)

    expect(mapping).toMatchObject({
      lastSyncedAt: '2026-10-21T12:00:00Z',
      lastSyncError: 'location missing',
    })
  })

  // Un back anterior a TESIS-177 no manda los campos: se leen como «nunca se
  // intentó», no como `undefined`.
  it('reads missing sync fields as never attempted', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(respond({ data: [MAPPING] }))

    const [mapping] = await fetchProductMappings(5)

    expect(mapping).toMatchObject({ lastSyncedAt: null, lastSyncError: null })
  })
})

describe('resyncProductMapping', () => {
  it('posts to the resync member route without a body and returns the mapping', async () => {
    const post = vi.spyOn(client, 'post').mockResolvedValueOnce(respond(MAPPING))

    const mapping = await resyncProductMapping(5, 4)

    expect(post).toHaveBeenCalledWith('/products/5/mappings/4/resync')
    expect(mapping).toMatchObject({ id: 4, serviceName: 'Shopify' })
  })
})
