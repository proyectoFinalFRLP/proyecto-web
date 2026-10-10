import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '../api'

import { useInventoryAlerts } from './useInventoryAlerts'

const LOADS = [
  { id: 1, name: 'CD Norte', storedUnits: 200, capacity: null },
  { id: 2, name: 'CD Sur', storedUnits: 50, capacity: null },
]

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(api, 'fetchStockAlertCounts').mockResolvedValue({ low: 18, outOfStock: 6 })
})

describe('useInventoryAlerts', () => {
  it('adds up the units of every warehouse', async () => {
    vi.spyOn(api, 'fetchWarehouseLoads').mockResolvedValue(LOADS)
    const { result } = renderHook(() => useInventoryAlerts(), { wrapper })

    await waitFor(() => expect(result.current.storedUnits).toBe(250))
  })

  // Sumar sobre la lista vacía daría 0, y un cero es un dato real: la empresa
  // no guarda nada. Que la consulta se haya caído no es eso.
  it('has no number at all when the warehouses never arrived', async () => {
    vi.spyOn(api, 'fetchWarehouseLoads').mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useInventoryAlerts(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.storedUnits).toBeUndefined()
  })

  // Que se caiga el listado de depósitos no tiene por qué dejar sin número a la
  // tarjeta de alertas: son dos preguntas distintas.
  it('keeps the alert count when only the warehouses failed', async () => {
    vi.spyOn(api, 'fetchWarehouseLoads').mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useInventoryAlerts(), { wrapper })

    await waitFor(() => expect(result.current.alerts.value).toBe(24))
  })

  // Una empresa sin depósitos sí guarda cero unidades, y eso se dice.
  it('says zero for a company that really has no warehouses', async () => {
    vi.spyOn(api, 'fetchWarehouseLoads').mockResolvedValue([])
    const { result } = renderHook(() => useInventoryAlerts(), { wrapper })

    await waitFor(() => expect(result.current.storedUnits).toBe(0))
  })
})
