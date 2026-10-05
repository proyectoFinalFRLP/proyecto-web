import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { activityKeys } from 'shared/api/activity'
import type { ApiRequestError } from 'shared/api/types'

import { createOrder, createOrderShipment, dispatchShipment } from '../api'
import { orderKeys } from '../queryKeys'
import type { CreateOrderPayload, DispatchPayload } from '../utils/shipping'

export interface ConfirmDraftOrderInput {
  order: CreateOrderPayload
  /**
   * `null` cuando la venta se retira en el local (TESIS-162): no hay envío que
   * abrir ni courier que despachar, así que la confirmación termina en el alta.
   */
  dispatch: DispatchPayload | null
}

interface Progress {
  orderId: number | null
  shipmentId: number | null
}

interface Options {
  /** Apenas existe la orden, antes de abrir el envío. */
  onOrderCreated?: (orderId: number) => void
}

/**
 * «Confirmar orden» del paso 3 (S07): crea la orden, abre su envío y lo
 * despacha con el operador elegido. Resuelve con el id de la orden.
 *
 * Son tres requests y no pueden ser uno atómico: el despacho llama a un courier
 * externo (ADR-016 del backend). Si falla después del alta, la orden ya existe
 * —y ya descontó el stock—, así que un reintento **retoma desde donde quedó**:
 * volver a crearla sería una segunda venta. `createdOrderId` le dice a la
 * pantalla si eso pasó.
 *
 * No hace falta distinguir hasta dónde llegó: con la orden creada, el detalle
 * termina el envío de las dos maneras —lo abre si no llegó a abrirse (TESIS-141)
 * y lo despacha si quedó `pending` (TESIS-134)—. `progress` sí lleva la cuenta,
 * pero puertas adentro, para que el reintento no repita lo que ya salió bien.
 */
export function useConfirmDraftOrder({ onOrderCreated }: Options = {}) {
  const queryClient = useQueryClient()
  const progress = useRef<Progress>({ orderId: null, shipmentId: null })
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null)

  const mutation = useMutation<number, ApiRequestError, ConfirmDraftOrderInput>({
    mutationFn: async ({ order, dispatch }) => {
      if (progress.current.orderId === null) {
        const created = await createOrder(order)
        progress.current.orderId = created.id
        setCreatedOrderId(created.id)
        onOrderCreated?.(created.id)
      }
      const orderId = progress.current.orderId

      // Retiro en el local: la venta queda registrada y ahí termina.
      if (dispatch === null) return orderId

      if (progress.current.shipmentId === null) {
        progress.current.shipmentId = (await createOrderShipment(orderId)).id
      }

      await dispatchShipment(progress.current.shipmentId, dispatch)

      return orderId
    },
    // También si falló el despacho: la orden ya existe y el stock ya se movió,
    // así que el listado y el inventario quedaron viejos igual.
    onSettled: () => {
      if (progress.current.orderId === null) return undefined

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        // El alta abre un envío y deja su rastro en la campanita, así que el
        // listado de envíos, los contadores de sus pestañas y el feed quedan
        // viejos lo mismo que el listado de órdenes. `['shipments']` va literal
        // porque es de otra feature; la actividad vive en `shared`.
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['shipments'] }),
        queryClient.invalidateQueries({ queryKey: activityKeys.all }),
      ])
    },
  })

  return { ...mutation, createdOrderId }
}
