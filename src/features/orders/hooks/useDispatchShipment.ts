import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activityKeys } from 'shared/api/activity'
import type { ApiRequestError } from 'shared/api/types'

import { dispatchShipment } from '../api'
import { orderKeys } from '../queryKeys'
import type { Shipment } from '../types'
import type { DispatchPayload } from '../utils/shipping'

export interface DispatchShipmentInput {
  shipmentId: number
  payload: DispatchPayload
}

/**
 * Despacha el envío de una orden desde su detalle (TESIS-134): pide la etiqueta
 * con el operador elegido (`POST /shipments/:id/dispatch`, TESIS-47).
 *
 * Un fallo no deja nada a medias —el backend no escribe si el courier no
 * confirmó—, así que reintentar es volver a llamar.
 */
export function useDispatchShipment() {
  const queryClient = useQueryClient()

  return useMutation<Shipment, ApiRequestError, DispatchShipmentInput>({
    mutationFn: ({ shipmentId, payload }) => dispatchShipment(shipmentId, payload),
    // También si falló: un 409 quiere decir que otro lo despachó mientras tanto,
    // y el detalle tiene que dejar de ofrecerlo. Invalidar el dominio entero
    // refresca además el courier que muestra el listado.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        // Despachar cambia el estado del envío: el listado de /shipments, los
        // contadores de sus pestañas y la campanita lo muestran y no se enteran
        // por el dominio de órdenes. Literales porque una feature no importa
        // las claves de otra.
        queryClient.invalidateQueries({ queryKey: ['shipments'] }),
        queryClient.invalidateQueries({ queryKey: activityKeys.all }),
      ]),
  })
}
