import type { IntegrationService } from 'shared/api'
import { describe, expect, it } from 'vitest'

import {
  buildConnectionSchema,
  defaultConnectionValues,
  toConnectionPayload,
  toFormFieldErrors,
  toJsRegExp,
} from './connectionForm'

const SHOPIFY: IntegrationService = {
  serviceId: 9,
  name: 'Shopify',
  type: 'ecommerce',
  authStrategy: 'oauth_client_credentials',
  credentialFields: [
    { key: 'client_id', label: 'Client ID', required: true, format: null },
    { key: 'client_secret', label: 'Client secret', required: true, format: null },
  ],
  settingFields: [
    {
      key: 'shop_domain',
      label: 'Dominio',
      required: true,
      format: '\\A[a-z0-9][a-z0-9-]*\\.myshopify\\.com\\z',
    },
    { key: 'location_id', label: 'Ubicación', required: false, format: null },
  ],
  configured: true,
  isActive: true,
  integrationId: 3,
  settings: { shop_domain: 'demo.myshopify.com' },
  credentialsSet: ['client_id'],
  testable: true,
  lastSyncedAt: null,
}

describe('toJsRegExp', () => {
  it('translates the Ruby anchors of the declared format', () => {
    expect(toJsRegExp('\\A[a-z]+\\z')?.source).toBe('^[a-z]+$')
  })

  it('gives up on a pattern that does not compile instead of blocking the form', () => {
    expect(toJsRegExp('\\A(unclosed\\z')).toBeNull()
  })
})

describe('buildConnectionSchema', () => {
  const schema = buildConnectionSchema(SHOPIFY)

  it('accepts a blank secret that is already loaded, and requires the missing one', () => {
    const result = schema.safeParse({
      credentials: { client_id: '', client_secret: '' },
      settings: { shop_domain: 'demo.myshopify.com', location_id: '' },
    })

    expect(result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))).toEqual([
      'credentials.client_secret',
    ])
  })

  it('rejects a value that does not match the declared format', () => {
    const result = schema.safeParse({
      credentials: { client_id: '', client_secret: 'shpss_x' },
      settings: { shop_domain: 'demo.com', location_id: '' },
    })

    expect(result.success).toBe(false)
  })
})

describe('defaultConnectionValues', () => {
  it('prefills the settings and never the secrets', () => {
    expect(defaultConnectionValues(SHOPIFY)).toEqual({
      credentials: { client_id: '', client_secret: '' },
      settings: { shop_domain: 'demo.myshopify.com', location_id: '' },
    })
  })
})

describe('toConnectionPayload', () => {
  it('leaves the blank secrets out so the stored ones are kept, but sends blank settings', () => {
    expect(
      toConnectionPayload({
        credentials: { client_id: '', client_secret: ' shpss_x ' },
        settings: { shop_domain: 'demo.myshopify.com', location_id: '' },
      }),
    ).toEqual({
      credentials: { client_secret: 'shpss_x' },
      settings: { shop_domain: 'demo.myshopify.com', location_id: '' },
    })
  })
})

describe('toFormFieldErrors', () => {
  it('maps the codes of a 422 to the inputs of the form', () => {
    expect(
      toFormFieldErrors({ 'settings.shop_domain': ['invalid_format'], 'credentials.x': ['what'] }),
    ).toEqual([
      { name: 'settings.shop_domain', message: 'El formato no es válido.' },
      { name: 'credentials.x', message: 'Revisá este dato.' },
    ])
  })
})
