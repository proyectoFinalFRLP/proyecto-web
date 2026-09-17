import { useQuery } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'

import { fetchOrder, fetchOrderShipment } from '../api'
import { orderKeys } from '../queryKeys'
import type { OrderDetail, OrderShipment } from '../types'

/** Detalle de la orden con sus líneas. Sin id válido la query no se dispara. */
export function useOrder(id: number | undefined) {
  return useQuery<OrderDetail, ApiRequestError>({
    queryKey: orderKeys.detail(id ?? 0),
    queryFn: () => fetchOrder(id ?? 0),
    enabled: id !== undefined,
  })
}

/**
 * El envío de la orden y su bitácora.
 *
 * Es una query aparte y no parte de `useOrder` para que un envío que no se
 * puede leer no tape la orden: la pantalla muestra las líneas y el cliente
 * igual, y el panel del envío dice que no pudo cargarlo.
 */
export function useOrderShipment(orderId: number | undefined) {
  return useQuery<OrderShipment, ApiRequestError>({
    queryKey: orderKeys.shipment(orderId ?? 0),
    queryFn: () => fetchOrderShipment(orderId ?? 0),
    enabled: orderId !== undefined,
  })
}
