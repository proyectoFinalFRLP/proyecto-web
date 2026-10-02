import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'

import { cancelOrder } from '../api'
import { orderKeys } from '../queryKeys'
import type { OrderDetail } from '../types'

/** Una línea no registra de qué depósito salió: la API no adivina a dónde devolverla. */
export const LINE_WITHOUT_WAREHOUSE_STATUS = 422

/**
 * Cancelación de una orden.
 *
 * Invalida órdenes e inventario —el stock vuelve a los depósitos— y lo hace
 * también al fallar: un 409 es una orden que otro canceló o despachó, y un 412
 * una que alguien modificó; en los dos casos el detalle tiene que mostrar lo
 * que hay ahora.
 */
export function useCancelOrder(id: number, version: string | null) {
  const queryClient = useQueryClient()

  return useMutation<OrderDetail, ApiRequestError, void>({
    mutationFn: () => cancelOrder(id, version),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        // Literal y no la factory de inventario: una feature no importa otra.
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
      ]),
  })
}
