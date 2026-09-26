import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { client } from 'shared/api/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useIntegrations } from './useIntegrations'

const ROW = {
  service_id: 7,
  service_name: 'Shopify',
  type: 'ecommerce',
  auth_strategy: 'oauth_client_credentials',
  credential_fields: [{ key: 'client_id', label: 'Client ID', required: true }],
  setting_fields: [{ key: 'shop_domain', label: 'Dominio', required: true, format: '\\A.+\\z' }],
  configured: true,
  is_active: true,
  integration_id: 3,
  settings: { shop_domain: 'demo.myshopify.com' },
  credentials_set: ['client_id'],
  testable: true,
}

// Un cliente por ejemplo, sin reintentos: un fallo tiene que verse en el acto
// y no arrastrarse al siguiente.
function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useIntegrations', () => {
  // La respuesta viaja envuelta en `data`, como toda colección de la API
  // (ADR-015 del backend, TESIS-107): si alguien vuelve a leerla como un array
  // pelado, este ejemplo se pone en rojo.
  it('reads the listing out of the data envelope and translates it to the domain', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: { data: [ROW] } } as never)

    const { result } = renderHook(() => useIntegrations(), { wrapper })

    await waitFor(() =>
      expect(result.current.data).toEqual([
        {
          serviceId: 7,
          name: 'Shopify',
          type: 'ecommerce',
          authStrategy: 'oauth_client_credentials',
          credentialFields: [
            { key: 'client_id', label: 'Client ID', required: true, format: null },
          ],
          settingFields: [
            { key: 'shop_domain', label: 'Dominio', required: true, format: '\\A.+\\z' },
          ],
          configured: true,
          isActive: true,
          integrationId: 3,
          settings: { shop_domain: 'demo.myshopify.com' },
          credentialsSet: ['client_id'],
          testable: true,
          lastSyncedAt: null,
        },
      ]),
    )
  })

  // Una fila vieja (sin los campos declarados) no rompe la pantalla: se lee como
  // una plantilla que no pide nada.
  it('tolerates a row without the declared fields', async () => {
    const legacy = {
      service_id: 1,
      service_name: 'ML',
      type: 'ecommerce',
      configured: false,
      is_active: false,
      integration_id: null,
    }
    vi.spyOn(client, 'get').mockResolvedValue({ data: { data: [legacy] } } as never)

    const { result } = renderHook(() => useIntegrations(), { wrapper })

    await waitFor(() => expect(result.current.data?.[0]?.credentialFields).toEqual([]))
  })

  it('surfaces a failure instead of pretending there are no integrations', async () => {
    vi.spyOn(client, 'get').mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useIntegrations(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
