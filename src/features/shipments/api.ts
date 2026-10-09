import { client } from 'shared/api/client'
import { fetchCount } from 'shared/api/count'

import type {
  ShipmentCounts,
  ShipmentFilters,
  ShipmentPage,
  ShipmentStatus,
  ShipmentSummary,
} from './types'

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
// filtre por el string vacío y devuelva cero filas. Con `search` el backend sí
// tolera el vacío —corta antes de armar la condición—, pero mandarlo igual
// ensucia la URL y la clave de caché, así que se omite por el mismo criterio.
function toParams({ page, perPage, status, orderId, search }: ShipmentFilters) {
  return {
    page,
    per_page: perPage,
    ...(status === undefined ? {} : { status }),
    ...(orderId === undefined ? {} : { order_id: orderId }),
    ...(search ? { search } : {}),
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
 * Pide una sola fila y lee nada más que el `meta.total`, que el backend cuenta
 * sobre el scope ya filtrado. Lo usa el KPI de envíos activos del panel, que
 * necesita un número suelto y no las cinco pestañas.
 */
export function fetchShipmentCount(status?: ShipmentStatus, search = ''): Promise<number> {
  return fetchCount('/shipments', {
    ...(status === undefined ? {} : { status }),
    ...(search ? { search } : {}),
  })
}

/**
 * Cuántos envíos cae en cada pestaña del listado (`GET /shipments/counts`).
 *
 * Eran cinco requests, uno por pestaña, cada uno pidiendo una fila sólo para
 * leer su `meta.total`. El backend los devuelve juntos desde TESIS-165,
 * respetando el mismo buscador que el listado: si no lo hiciera, buscar un
 * seguimiento dejaría la tabla con una fila y la pestaña diciendo «Todos (20)».
 */
export async function fetchShipmentCounts(search = ''): Promise<ShipmentCounts> {
  const { data } = await client.get<{ data: ShipmentCounts }>('/shipments/counts', {
    params: search ? { search } : {},
  })

  return data.data
}
