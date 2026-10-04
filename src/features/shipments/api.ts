import { client } from 'shared/api/client'
import { fetchCount } from 'shared/api/count'

import type { ShipmentFilters, ShipmentPage, ShipmentStatus, ShipmentSummary } from './types'

// Frontera con Rails del listado de envíos. Único lugar de la feature que
// conoce el endpoint y el snake_case.
//
// `GET /api/v1/shipments` existe paginado y filtrado desde TESIS-113, y hasta
// TESIS-163 lo consumían sólo el KPI del panel y la resolución del envío de una
// orden. La pantalla lo usa como lo que es: un listado.

interface ApiCourier {
  id: number
  service_id: number
  name: string
}

interface ApiShipmentSummary {
  id: number
  order_id: number
  status: ShipmentStatus
  tracking_number: string | null
  shipping_cost: number | null
  courier: ApiCourier | null
  created_at: string
}

interface ApiList<T> {
  data: T[]
  meta: { page: number; per_page: number; total: number }
}

function toCourier(courier: ApiCourier | null): ShipmentSummary['courier'] {
  if (courier === null) return null

  return { id: courier.id, serviceId: courier.service_id, name: courier.name }
}

function toShipment(shipment: ApiShipmentSummary): ShipmentSummary {
  return {
    id: shipment.id,
    orderId: shipment.order_id,
    status: shipment.status,
    trackingNumber: shipment.tracking_number,
    shippingCost: shipment.shipping_cost,
    courier: toCourier(shipment.courier),
    createdAt: shipment.created_at,
  }
}

// Un filtro vacío no viaja: mandar `status=` en blanco haría que el backend
// filtre por el string vacío y devuelva cero filas.
function toParams({ page, perPage, status, orderId }: ShipmentFilters) {
  return {
    page,
    per_page: perPage,
    ...(status === undefined ? {} : { status }),
    ...(orderId === undefined ? {} : { order_id: orderId }),
  }
}

export async function fetchShipmentPage(filters: ShipmentFilters): Promise<ShipmentPage> {
  const { data } = await client.get<ApiList<ApiShipmentSummary>>('/shipments', {
    params: toParams(filters),
  })

  return {
    shipments: data.data.map(toShipment),
    page: data.meta.page,
    perPage: data.meta.per_page,
    total: data.meta.total,
  }
}

/**
 * Cuántos envíos matchean un estado, sin traerlos.
 *
 * Alimenta los contadores de las pestañas: pide una sola fila y lee nada más
 * que el `meta.total`, que el backend cuenta sobre el scope ya filtrado. Es el
 * mismo `fetchCount` que usan el panel y el catálogo.
 */
export function fetchShipmentCount(status?: ShipmentStatus): Promise<number> {
  return fetchCount('/shipments', status === undefined ? {} : { status })
}
