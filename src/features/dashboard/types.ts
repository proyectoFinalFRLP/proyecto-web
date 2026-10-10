/**
 * Un depósito y las unidades que guarda, para el widget de carga del panel
 * (TESIS-55).
 *
 * Desde TESIS-162 el depósito puede declarar su capacidad, y entonces la barra
 * mide ocupación de verdad. Sin capacidad declarada sigue comparando los
 * depósitos entre sí, que es la única comparación real que queda.
 */
export interface WarehouseLoad {
  id: number
  name: string
  /** Suma de las unidades en stock del depósito. Cero es un dato, no un faltante. */
  storedUnits: number
  /**
   * Capacidad declarada, en unidades. `null` cuando nadie la cargó: no es cero,
   * que diría que no entra nada.
   */
  capacity: number | null
}

/** Los cuatro estados del envío (`Shipment::STATUSES`). */
export type ShipmentStatus = 'pending' | 'ready_to_ship' | 'in_transit' | 'delivered'

/**
 * Una fila de la tarjeta «Últimos envíos» del panel (TESIS-163).
 *
 * Reemplaza a la tarjeta de Integraciones, que mostraba la salud de los nodos.
 * `trackingNumber` y `courier` llegan vacíos mientras el envío está `pending`:
 * los dos los asigna el courier al confirmar el despacho (TESIS-47).
 */
export interface DispatchedShipment {
  id: number
  orderId: number
  status: ShipmentStatus
  trackingNumber: string | null
  courier: string | null
  createdAt: string
}

/** Los tres estados que el backend acepta (`Order::STATUSES`). */
export type OrderStatus = 'pending' | 'paid' | 'cancelled'

/**
 * Una fila de la tabla de órdenes recientes del panel (TESIS-56). Es la fila de
 * `GET /api/v1/orders` recortada a las cinco columnas que el diseño dibuja.
 *
 * Tres campos pueden llegar vacíos y la tabla tiene que tolerarlo:
 * `externalOrderId` es null en las ventas cargadas a mano, `customerAddress` y
 * `customerZipCode` en las órdenes viejas sin destino, y `totalAmount` en las
 * anteriores a TESIS-114.
 */
export interface RecentOrder {
  id: number
  externalOrderId: string | null
  customerAddress: string | null
  customerZipCode: string | null
  status: OrderStatus
  totalAmount: number | null
  createdAt: string
}
