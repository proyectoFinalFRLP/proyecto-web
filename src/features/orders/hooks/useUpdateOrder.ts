import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'

import { updateOrder } from '../api'
import { orderKeys } from '../queryKeys'
import type { OrderDetail, UpdateOrderPayload } from '../types'

/** La API rechaza con 412 el guardado que parte de una versión vieja. */
export const STALE_VERSION_STATUS = 412

/** Orden cancelada o con el envío ya despachado: no hay body que la haga editable. */
export const NOT_EDITABLE_STATUS = 409

/**
 * Guardado de la modificación de una orden.
 *
 * Al terminar invalida el dominio entero de órdenes —el listado muestra el total
 * y el destino— y el catálogo: cambiar las líneas mueve stock, así que el
 * `total_stock` del inventario y el stock por depósito también quedaron viejos.
 */
export function useUpdateOrder(id: number, version: string | null) {
  const queryClient = useQueryClient()

  return useMutation<OrderDetail, ApiRequestError, UpdateOrderPayload>({
    mutationFn: (payload) => updateOrder(id, payload, version),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        // Literal y no la factory de inventario: una feature no importa otra.
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
      ]),
  })
}
