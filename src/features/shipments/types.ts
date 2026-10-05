// Tipos del dominio de envíos. Espejo de `GET /api/v1/shipments`, ya en
// camelCase: ningún componente ve la forma cruda de Rails.

/** Los cuatro estados del envío (`Shipment::STATUSES`), en el orden del ciclo. */
export type ShipmentStatus = 'pending' | 'ready_to_ship' | 'in_transit' | 'delivered'

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
}
