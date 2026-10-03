import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'

import { updateOrder } from '../api'
import { orderKeys, quoteKeys } from '../queryKeys'
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
 * Y borra la cotización de la orden, que dependía de esas líneas y ese destino.
 */
export function useUpdateOrder(id: number, version: string | null) {
  const queryClient = useQueryClient()

  return useMutation<OrderDetail, ApiRequestError, UpdateOrderPayload>({
    mutationFn: (payload) => updateOrder(id, payload, version),
    onSuccess: () => {
      // La cotización de esta orden se calculó con las líneas y el destino de
      // antes: dura un minuto en caché, y despachar dentro de ese minuto mandaba
      // el costo viejo (hallazgo de auditoría, TESIS-89). Se borra y no sólo se
      // invalida: el diálogo de despacho está cerrado, y una entrada invalidada
      // se seguiría mostrando hasta que vuelva la nueva.
      queryClient.removeQueries({ queryKey: [...quoteKeys.all, 'order', id] })

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        // Literal y no la factory de inventario: una feature no importa otra.
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
      ])
    },
  })
}
