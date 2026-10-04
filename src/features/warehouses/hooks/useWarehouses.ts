import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'

import { createWarehouse, deleteWarehouse, fetchWarehouses, updateWarehouse } from '../api'
import { warehouseKeys } from '../queryKeys'
import type { Warehouse, WarehouseInput } from '../types'

/** Status con el que la API rechaza borrar un depósito con historia. */
export const RESTRICTED_STATUS = 409

export function useWarehouseList() {
  return useQuery<Warehouse[]>({
    queryKey: warehouseKeys.list(),
    queryFn: fetchWarehouses,
  })
}

/**
 * Invalida **todas** las queries y no sólo las de esta feature.
 *
 * Los depósitos llenan selects y tarjetas de otras pantallas —el modal de
 * producto, el alta manual de órdenes, la carga por depósito del panel—, y cada
 * una tiene su propia clave en su feature, que esta no puede importar
 * (feature-structure.md). Dar de alta o renombrar un depósito es poco
 * frecuente: refrescar de más es más barato que mostrar un nombre viejo.
 */
function useInvalidateEverything() {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries()
}

export function useCreateWarehouse() {
  const invalidate = useInvalidateEverything()

  return useMutation<Warehouse, ApiRequestError, WarehouseInput>({
    mutationFn: createWarehouse,
    onSuccess: invalidate,
  })
}

export function useUpdateWarehouse() {
  const invalidate = useInvalidateEverything()

  return useMutation<Warehouse, ApiRequestError, { id: number; input: WarehouseInput }>({
    mutationFn: ({ id, input }) => updateWarehouse(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteWarehouse() {
  const invalidate = useInvalidateEverything()

  return useMutation<void, ApiRequestError, number>({
    mutationFn: deleteWarehouse,
    onSuccess: invalidate,
  })
}
