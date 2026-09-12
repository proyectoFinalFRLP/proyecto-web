// Tipos del dominio de órdenes.
//
// Como en el resto de las features, el dominio se declara en camelCase y la
// traducción desde el snake_case de la API Rails vive en `api.ts`: ningún
// componente ve la forma cruda de la respuesta.

/** Los tres estados que el backend acepta (`Order::STATUSES`). */
export type OrderStatus = 'pending' | 'paid' | 'cancelled'

/**
 * Fila del listado (`GET /api/v1/orders`). El index usa `OrderListSerializer`,
 * que **no trae las líneas de la orden**: el detalle de qué se vendió sólo
 * viene en `GET /orders/:id`.
 *
 * Tres campos pueden llegar vacíos y la pantalla tiene que tolerarlo:
 *
 * · `externalOrderId` es null en las ventas cargadas a mano, que no vienen de
 *   ningún canal externo.
 * · `carrier` cuelga del envío: es null mientras la orden no tenga envío o el
 *   envío no tenga courier asignado, que es el caso más frecuente.
 * · `totalAmount` es null en las órdenes anteriores a TESIS-114 que no tienen
 *   líneas.
 */
export interface OrderSummary {
  id: number
  externalOrderId: string | null
  customerName: string
  customerAddress: string | null
  customerZipCode: string | null
  status: OrderStatus
  carrier: string | null
  totalAmount: number | null
  itemCount: number
  createdAt: string
}

/** Cómo viene paginado el listado: el `meta` del backend, ya en camelCase. */
export interface OrderPage {
  orders: OrderSummary[]
  page: number
  perPage: number
  total: number
}

/** Filtros que viajan como query params a `GET /api/v1/orders`. */
export interface OrderFilters {
  page: number
  perPage: number
  /** Sin estado, el backend devuelve todas. */
  status?: OrderStatus
  /** Busca por id externo, nombre de cliente o dirección. */
  search?: string
}
