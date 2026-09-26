import type { ApiRequestError, IntegrationService } from 'shared/api'
import { describe, expect, it } from 'vitest'

import { linkableChannels, linkErrorMessage } from './channels'

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
      [{ id: 1, companyIntegrationId: 11, serviceName: 'Tiendanube', externalProductId: '9' }],
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
