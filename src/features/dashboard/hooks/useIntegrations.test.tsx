import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { client } from 'shared/api/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useIntegrations } from './useIntegrations'

const NODE = {
  service_id: 7,
  service_name: 'Andreani',
  type: 'courier',
  uri: 'https://andreani.test',
  http_method: 'POST',
  configured: true,
  is_active: true,
  integration_id: 3,
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
  // (ADR-015 del backend, TESIS-107). Hasta entonces este endpoint era el único
  // que contestaba un array pelado; si alguien vuelve a leerlo así, o si el
  // backend deja de envolverlo, este ejemplo se pone en rojo.
  it('reads the listing out of the data envelope', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: { data: [NODE] } } as never)

    const { result } = renderHook(() => useIntegrations(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual([NODE]))
  })

  it('asks the integrations endpoint', async () => {
    const get = vi.spyOn(client, 'get').mockResolvedValue({ data: { data: [] } } as never)

    const { result } = renderHook(() => useIntegrations(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(get).toHaveBeenCalledWith('/integrations')
  })

  it('surfaces a failure instead of pretending there are no integrations', async () => {
    vi.spyOn(client, 'get').mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useIntegrations(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
