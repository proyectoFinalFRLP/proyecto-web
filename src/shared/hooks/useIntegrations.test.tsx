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
  configured: true,
  is_active: true,
  integration_id: 3,
  account_name: 'Tienda Norte',
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
          configured: true,
          isActive: true,
          integrationId: 3,
          accountName: 'Tienda Norte',
          lastSyncedAt: null,
        },
      ]),
    )
  })

  // Una integración que nunca se probó no sabe con qué cuenta está conectada.
  it('reads a missing account name as unknown', async () => {
    const withoutAccount: Partial<typeof ROW> = { ...ROW }
    delete withoutAccount.account_name
    vi.spyOn(client, 'get').mockResolvedValue({ data: { data: [withoutAccount] } } as never)

    const { result } = renderHook(() => useIntegrations(), { wrapper })

    await waitFor(() => expect(result.current.data?.[0]?.accountName).toBeNull())
  })

  it('surfaces a failure instead of pretending there are no integrations', async () => {
    vi.spyOn(client, 'get').mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useIntegrations(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
