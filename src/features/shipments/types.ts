import type { DataTableSort } from 'shared/components'

// Tipos del dominio de envíos. Espejo de `GET /api/v1/shipments`, ya en
// camelCase: ningún componente ve la forma cruda de Rails.

/**
 * Los estados del envío (`Shipment::STATUSES`): los cuatro del ciclo, en orden,
 * y los dos finales sin entrega (TESIS-188), devuelto y cancelado. Uno que la
 * API mande y este tipo no tenga se muestra como desconocido, no revienta.
 */
export type ShipmentStatus =
  | 'pending'
  | 'ready_to_ship'
  | 'in_transit'
  | 'delivered'
  | 'returned'
  | 'cancelled'

/** El operador logístico: la integración de la empresa con el courier. */
export interface Courier {
  id: number
  serviceId: number
  name: string
}

/**
 * Una fila del listado de envíos.
 *
 * `trackingNumber`, `courier` y `shippingCost` llegan vacíos mientras el envío
 * está `pending`: los tres los completa la confirmación del despacho
 * (TESIS-47). La fila tiene que tolerarlo sin dibujar huecos.
 */
export interface ShipmentSummary {
  id: number
  orderId: number
  /**
   * El número con el que el canal conoce la orden (TESIS-181). `null` en las
   * ventas manuales: ahí se muestra el id interno, igual que en órdenes.
   */
  externalOrderId: string | null
  /** El número que muestra la tienda (TESIS-180): «#1001» en Shopify. */
  externalOrderNumber: string | null
  status: ShipmentStatus
  trackingNumber: string | null
  shippingCost: number | null
  courier: Courier | null
  createdAt: string
}

/** Cómo viene paginado el listado: el `meta` del backend, ya en camelCase. */
export interface ShipmentPage {
  shipments: ShipmentSummary[]
  page: number
  perPage: number
  total: number
}

/** Lo que el listado manda como query string. */
export interface ShipmentFilters {
  page: number
  perPage: number
  status?: ShipmentStatus
  /** Filtra los envíos de una orden concreta. */
  orderId?: number
  /** Número de seguimiento o id del canal. Vacío es «sin buscar». */
  search?: string
  /** Orden por columna (TESIS-184). Sin orden, el de siempre: los más nuevos primero. */
  sort?: DataTableSort | null
}

/**
 * Cuántos envíos caen en cada pestaña del listado (`GET /shipments/counts`).
 *
 * Una clave por pestaña y no un array por índice: la pantalla las lee por
 * nombre, así que agregar un estado al ciclo de vida no puede correr un
 * contador de lugar.
 *
 * Se deriva de `ShipmentStatus` en vez de repetir los cuatro estados: sumar uno
 * al ciclo de vida lo pide acá solo, y la respuesta de la API lo trae porque el
 * backend arma las pestañas sobre `Shipment::STATUSES`. `all` es la pestaña sin
 * filtro, que no es un estado.
 *
 * Opcionales: una API anterior a los finales sin entrega (TESIS-188) no manda
 * `returned` ni `cancelled`, y la pestaña queda sin número en vez de decir 0.
 */
export type ShipmentCounts = Partial<Record<ShipmentStatus | 'all', number>>
