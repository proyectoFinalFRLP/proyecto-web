import { client } from 'shared/api/client'

import type { OrderFilters, OrderPage, OrderStatus, OrderSummary } from './types'

// Frontera con la API Rails. Lo que entra en snake_case se traduce acá y sale
// como el dominio en camelCase.
//
// El listado envuelve en `{ data: [...], meta: {...} }`, y el `meta.total`
// cuenta el scope **ya filtrado**, no la tabla entera: de eso dependen tanto el
// paginador como los contadores de las pestañas.

/**
 * El operador logístico, tal como lo devuelve la API. Es la integración de la
 * empresa con el courier, y viaja con la misma forma en el listado de órdenes y
 * en los dos endpoints de envíos.
 *
 * `null` no es un dato faltante: el envío nace sin courier y se le asigna al
 * confirmar el despacho, y una orden puede no tener envío todavía.
 */
interface ApiCourier {
  id: number
  service_id: number
  name: string
}

interface ApiOrderSummary {
  id: number
  external_order_id: string | null
  customer_name: string
  customer_address: string | null
  customer_zip_code: string | null
  status: OrderStatus
  courier: ApiCourier | null
  total_amount: number | null
  item_count: number
  created_at: string
}

interface ApiOrderList {
  data: ApiOrderSummary[]
  meta: { page: number; per_page: number; total: number }
}

function toOrder(order: ApiOrderSummary): OrderSummary {
  return {
    id: order.id,
    externalOrderId: order.external_order_id,
    customerName: order.customer_name,
    customerAddress: order.customer_address,
    customerZipCode: order.customer_zip_code,
    status: order.status,
    // La columna sólo muestra el nombre, así que el dominio se queda con eso y
    // no arrastra el id de la integración hasta la tabla. Si alguna pantalla
    // necesita enlazar a la integración, el id está acá para levantarlo.
    carrier: order.courier?.name ?? null,
    totalAmount: order.total_amount,
    itemCount: order.item_count,
    createdAt: order.created_at,
  }
}

// Un filtro vacío no viaja: mandar `status=` o `search=` en blanco haría que el
// backend filtre por cadena vacía y devuelva cero filas.
function toParams({ page, perPage, status, search }: OrderFilters) {
  return {
    page,
    per_page: perPage,
    ...(status === undefined ? {} : { status }),
    ...(search === undefined || search === '' ? {} : { search }),
  }
}

export async function fetchOrderPage(filters: OrderFilters): Promise<OrderPage> {
  const { data } = await client.get<ApiOrderList>('/orders', { params: toParams(filters) })

  return {
    orders: data.data.map(toOrder),
    page: data.meta.page,
    perPage: data.meta.per_page,
    total: data.meta.total,
  }
}

/**
 * Cuántas órdenes matchean un filtro, sin traerlas.
 *
 * Alimenta los contadores de las pestañas. Pide una sola fila y lee nada más
 * que el `meta.total`, que es el conteo del scope filtrado: es el mismo truco
 * que usan los KPIs del tablero (TESIS-53) y evita traer cuatro páginas
 * completas para mostrar cuatro números.
 */
export async function fetchOrderCount(status?: OrderStatus, search?: string): Promise<number> {
  const { data } = await client.get<ApiOrderList>('/orders', {
    params: toParams({ page: 1, perPage: 1, status, search }),
  })

  return data.meta.total
}
