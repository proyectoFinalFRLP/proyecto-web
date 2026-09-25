import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '../api'
import { catalogKeys } from '../queryKeys'

import { useCatalogProducts } from './useCatalogProducts'

// Un cliente por ejemplo: la caché no puede filtrarse de un test al siguiente.
function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useCatalogProducts', () => {
  it('asks the backend for the term it was given', async () => {
    const fetchCatalog = vi.spyOn(api, 'fetchCatalogProducts').mockResolvedValue([])

    const { result } = renderHook(() => useCatalogProducts('cable'), {
      wrapper: makeWrapper(newClient()),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchCatalog).toHaveBeenCalledWith('cable')
  })

  // «cab» y «cab » son la misma búsqueda. Si el término entrara sin recortar en
  // la clave serían dos entradas de caché y dos requests con la misma respuesta.
  it('treats a term with surrounding spaces as the same search', async () => {
    const fetchCatalog = vi.spyOn(api, 'fetchCatalogProducts').mockResolvedValue([])
    const queryClient = newClient()

    const { result } = renderHook(() => useCatalogProducts('  cable  '), {
      wrapper: makeWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchCatalog).toHaveBeenCalledWith('cable')
  })

  it('files it in the cache under the trimmed term', async () => {
    vi.spyOn(api, 'fetchCatalogProducts').mockResolvedValue([])
    const queryClient = newClient()

    const { result } = renderHook(() => useCatalogProducts('cable '), {
      wrapper: makeWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(catalogKeys.products('cable'))).toEqual([])
  })

  // Mientras llega la búsqueda nueva se siguen mostrando las coincidencias de
  // la anterior: es lo que evita que la lista parpadee vacía entre pulsaciones.
  it('keeps the previous matches while the new search travels', async () => {
    const product = {
      id: 1,
      sku: 'CAB-1',
      name: 'Cable',
      category: 'Electronics',
      weight: 0.2,
      totalStock: 5,
    }
    vi.spyOn(api, 'fetchCatalogProducts').mockResolvedValue([product])
    const queryClient = newClient()

    const { result, rerender } = renderHook((term: string) => useCatalogProducts(term), {
      wrapper: makeWrapper(queryClient),
      initialProps: 'cab',
    })
    await waitFor(() => expect(result.current.data).toEqual([product]))

    rerender('cable')

    expect(result.current.data).toEqual([product])
  })
})
