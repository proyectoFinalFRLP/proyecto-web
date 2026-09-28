import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import type { ApiRequestError } from 'shared/api/types'

import { createOrder, createOrderShipment, dispatchShipment } from '../api'
import { orderKeys } from '../queryKeys'
import type { CreateOrderPayload, DispatchPayload } from '../utils/shipping'

export interface ConfirmDraftOrderInput {
  order: CreateOrderPayload
  dispatch: DispatchPayload
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

      if (progress.current.shipmentId === null) {
        const shipment = await createOrderShipment(orderId)
        progress.current.shipmentId = shipment.id
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
        // Literal y no la factory de inventario: una feature no importa otra.
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
      ])
    },
  })

  return { ...mutation, createdOrderId }
}
