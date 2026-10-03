import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'

import { createOrderShipment } from '../api'
import { orderKeys } from '../queryKeys'
import type { Shipment } from '../types'

/**
 * Abre el envío de una orden desde su detalle (TESIS-141): `POST
 * /orders/:id/shipment` (TESIS-105). Nace `pending` y sin courier; elegirlo es
 * la otra acción, la de despachar (TESIS-134).
 *
 * `onSettled` y no `onSuccess`: un 409 quiere decir que el envío ya existe
 * —otra pestaña, o el asistente del alta— y lo que corresponde ahí es traer el
 * que ya está, no insistir. El detalle se refresca en los dos casos.
 */
export function useCreateOrderShipment() {
  const queryClient = useQueryClient()

  return useMutation<Shipment, ApiRequestError, number>({
    mutationFn: (orderId) => createOrderShipment(orderId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
