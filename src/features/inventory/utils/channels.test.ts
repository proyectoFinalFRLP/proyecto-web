import type { ApiRequestError, IntegrationService, StockSyncStatus } from 'shared/api'
import { describe, expect, it } from 'vitest'

import type { ProductMapping } from '../types'

import {
  canRetry,
  linkableChannels,
  linkErrorMessage,
  mappingSyncStatus,
  resyncErrorMessage,
  stockSyncWarnings,
  syncErrorText,
} from './channels'

function integration(overrides: Partial<IntegrationService>): IntegrationService {
  return {
    serviceId: 1,
    name: 'Shopify',
    type: 'ecommerce',
    configured: true,
    isActive: true,
    integrationId: 10,
    accountName: null,
    lastSyncedAt: null,
    stockSync: null,
    ...overrides,
  }
}

function mapping(overrides: Partial<ProductMapping> = {}): ProductMapping {
  return {
    id: 1,
    companyIntegrationId: 10,
    serviceName: 'Shopify',
    externalProductId: '9',
    lastSyncedAt: null,
    lastSyncError: null,
    ...overrides,
  }
}

function stockSync(overrides: Partial<StockSyncStatus> = {}): StockSyncStatus {
  return {
    ready: true,
    missingSettings: [],
    failingProducts: 0,
    lastSyncError: null,
    lastSyncedAt: null,
    ...overrides,
  }
}

describe('linkableChannels', () => {
  it('offers only the connected, active sales channels where the product is not published', () => {
    const channels = linkableChannels(
      [
        integration({ integrationId: 10, name: 'Shopify' }),
        integration({ integrationId: 11, name: 'Tiendanube' }),
        integration({ integrationId: 12, name: 'Inactivo', isActive: false }),
        integration({ integrationId: null, name: 'Sin conectar', configured: false }),
        integration({ integrationId: 13, name: 'OCA', type: 'courier' }),
      ],
      [mapping({ companyIntegrationId: 11, serviceName: 'Tiendanube' })],
    )

    expect(channels).toEqual([{ integrationId: 10, name: 'Shopify' }])
  })
})

describe('linkErrorMessage', () => {
  const error = (status: number): ApiRequestError =>
    Object.assign(new Error('raw english message'), { status })

  it('explains in the language of the screen why the channel refused the link', () => {
    expect([409, 422, 502].map((status) => linkErrorMessage(error(status)))).toEqual([
      'Esa publicación ya está vinculada a otro producto.',
      'El canal no tiene una publicación con ese ID (o con el SKU del producto).',
      'El canal no respondió. Probá de nuevo en unos minutos.',
    ])
  })

  it('falls back to the message of the API for any other status', () => {
    expect(linkErrorMessage(error(500))).toBe('raw english message')
  })
})

describe('mappingSyncStatus', () => {
  const now = new Date('2026-10-21T12:00:00Z')

  it('tells when the stock was last published', () => {
    expect(mappingSyncStatus(mapping({ lastSyncedAt: '2026-10-21T11:55:00Z' }), now)).toEqual({
      tone: 'ok',
      text: 'Sincronizado hace 5 minutos',
    })
  })

  // El motivo gana aunque haya fecha: la fecha es la del intento que falló.
  it('tells why the last attempt failed', () => {
    expect(
      mappingSyncStatus(
        mapping({ lastSyncedAt: '2026-10-21T11:55:00Z', lastSyncError: 'no location' }),
        now,
      ),
    ).toEqual({ tone: 'error', text: 'No se pudo publicar el stock: no location' })
  })

  it('says nothing for a link that was never published', () => {
    expect(mappingSyncStatus(mapping(), now)).toBeNull()
  })
})

describe('canRetry', () => {
  it('offers a retry after a failure or when it was never published, not when it is up to date', () => {
    expect([
      canRetry(mapping({ lastSyncedAt: '2026-10-21T11:55:00Z', lastSyncError: 'boom' })),
      canRetry(mapping()),
      canRetry(mapping({ lastSyncedAt: '2026-10-21T11:55:00Z' })),
    ]).toEqual([true, true, false])
  })
})

describe('resyncErrorMessage', () => {
  const error = (status: number): ApiRequestError =>
    Object.assign(new Error('the integration has no location'), { status })

  it('shows the reason of a channel that cannot publish', () => {
    expect(resyncErrorMessage(error(422))).toBe(
      'No se pudo publicar el stock: the integration has no location',
    )
  })

  it('does not repeat the prefix when the API reason already explains itself', () => {
    const reason =
      'Shopify cannot publish stock: the integration has no Ubicación de stock (location_id) configured'

    expect(resyncErrorMessage(Object.assign(new Error(reason), { status: 422 }))).toBe(reason)
  })

  it('asks to wait when the retries hit the rate limit', () => {
    expect(resyncErrorMessage(error(429))).toBe('Esperá un minuto antes de reintentar.')
  })

  it('explains a link that no longer exists and falls back to the API message otherwise', () => {
    expect([404, 500].map((status) => resyncErrorMessage(error(status)))).toEqual([
      'Ese vínculo ya no existe. Recargá la página.',
      'the integration has no location',
    ])
  })
})

describe('syncErrorText', () => {
  it('prefixes a provider error and leaves a self-explaining reason as is', () => {
    expect(syncErrorText('Not Found (status 404)')).toBe(
      'No se pudo publicar el stock: Not Found (status 404)',
    )
    expect(syncErrorText('Shopify cannot publish stock for this product: the link has no x')).toBe(
      'Shopify cannot publish stock for this product: the link has no x',
    )
  })
})

describe('stockSyncWarnings', () => {
  it('names the missing settings and counts the products left unpublished', () => {
    const warnings = stockSyncWarnings([
      integration({
        stockSync: stockSync({
          ready: false,
          missingSettings: [{ key: 'location_id', label: 'Ubicación de stock' }],
          failingProducts: 3,
        }),
      }),
    ])

    expect(warnings).toEqual([
      {
        integrationId: 10,
        name: 'Shopify',
        messages: ['Falta configurar: Ubicación de stock', '3 productos sin publicar'],
      },
    ])
  })

  it('uses the singular for a single product', () => {
    const [warning] = stockSyncWarnings([
      integration({ stockSync: stockSync({ failingProducts: 1 }) }),
    ])

    expect(warning?.messages).toEqual(['1 producto sin publicar'])
  })

  it('stays quiet for healthy, inactive or non-publishing channels', () => {
    expect(
      stockSyncWarnings([
        integration({ stockSync: stockSync() }),
        integration({ stockSync: null }),
        integration({ isActive: false, stockSync: stockSync({ failingProducts: 2 }) }),
      ]),
    ).toEqual([])
  })
})
