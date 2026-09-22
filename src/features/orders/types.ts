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
 * · `carrier` es el nombre del operador logístico. La API lo devuelve como el
 *   objeto `courier` —el mismo que exponen los endpoints de envíos—; la capa de
 *   api.ts se queda con el nombre, que es lo único que la tabla muestra.
 *   Cuelga del envío: es null mientras la orden no tenga envío o el
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

/** Una línea de la orden, con el producto que se vendió. */
export interface OrderLine {
  id: number
  productId: number
  sku: string
  productName: string
  quantity: number
  /** Precio facturado en la línea, no el precio actual del producto. */
  unitPrice: number
}

/**
 * Detalle de la orden (`GET /api/v1/orders/:id`). A diferencia del listado trae
 * las líneas, pero no el envío: ése se pide aparte a `GET /shipments`.
 */
export interface OrderDetail {
  id: number
  externalOrderId: string | null
  customerName: string
  customerDocument: string | null
  customerAddress: string | null
  customerZipCode: string | null
  status: OrderStatus
  /** Lo que suman las líneas, persistido al crear la orden (TESIS-114). */
  totalAmount: number | null
  lines: OrderLine[]
  createdAt: string
}

/** Los cuatro estados del envío (`Shipment::STATUSES`), en el orden del ciclo. */
export type ShipmentStatus = 'pending' | 'ready_to_ship' | 'in_transit' | 'delivered'

/** El operador logístico: la integración de la empresa con el courier. */
export interface Courier {
  id: number
  serviceId: number
  name: string
}

/**
 * Una entrada de la bitácora del envío. `internalStatus` es el vocabulario
 * normalizado del sistema y `externalStatus` el texto crudo que mandó el
 * courier: la pantalla muestra los dos.
 */
export interface ShipmentEvent {
  id: number
  internalStatus: ShipmentStatus
  externalStatus: string
  description: string | null
  occurredAt: string
}

/** Detalle del envío (`GET /api/v1/shipments/:id`), con su bitácora. */
export interface Shipment {
  id: number
  orderId: number
  status: ShipmentStatus
  /** Null hasta que el courier confirma el despacho. */
  trackingNumber: string | null
  /** Null mientras no se cotizó: un envío sin cotizar no cuesta 0. */
  shippingCost: number | null
  /** Null hasta que se asigna el courier al confirmar el despacho. */
  courier: Courier | null
  /** Ordenados por `occurredAt`, del más viejo al más nuevo. */
  events: ShipmentEvent[]
}

/**
 * El envío de una orden, tal como lo resuelve la pantalla.
 *
 * El modelo garantiza un envío por orden (índice único sobre `order_id`), pero
 * la pantalla no lo da por sentado: si la API devolviera más de uno, elegir
 * cualquiera mostraría un tracking y un costo que pueden no ser los de la
 * orden. `duplicated` es ese caso, y la pantalla lo informa en vez de adivinar.
 */
export type OrderShipment =
  | { kind: 'none' }
  | { kind: 'single'; shipment: Shipment }
  | { kind: 'duplicated'; count: number }

/**
 * Lo que los paneles del envío tienen para mostrar: el envío ya resuelto, o
 * por qué todavía no hay uno. La carga y el error son estados de la pantalla,
 * no del dominio, pero los paneles los dibujan igual que los otros casos.
 */
export type ShipmentView =
  | OrderShipment
  | { kind: 'loading' }
  | { kind: 'error'; onRetry: () => void }

/** Filtros que viajan como query params a `GET /api/v1/orders`. */
export interface OrderFilters {
  page: number
  perPage: number
  /** Sin estado, el backend devuelve todas. */
  status?: OrderStatus
  /** Busca por id externo, nombre de cliente o dirección. */
  search?: string
}

/**
 * Un producto del catálogo como lo ve el buscador del alta manual (paso 1 del
 * asistente, S05). Es la fila de `GET /api/v1/products` recortada a lo que el
 * picker muestra y lo que la línea del borrador necesita copiar.
 *
 * No hay precio: `products` no tiene esa columna, así que el precio unitario
 * de cada línea lo carga quien arma la orden y viaja en `unit_price`.
 */
export interface CatalogProduct {
  id: number
  sku: string
  name: string
  /** Una de `Product::CATEGORIES`, o null en los productos anteriores a TESIS-102. */
  category: string | null
  /** Peso unitario en kg. */
  weight: number
  /** Unidades sumando todos los depósitos. */
  totalStock: number
}

/**
 * Un depósito de la empresa, como lo muestra el paso 2 del alta manual. Espejo
 * de `GET /api/v1/warehouses`, que ya viene acotado al tenant del usuario.
 */
export interface OriginWarehouse {
  id: number
  name: string
  address: string
  zipCode: string
}

/**
 * Cuántas unidades de un producto hay en cada depósito, por id de depósito. Sale
 * de `GET /api/v1/products/:id`: el listado del catálogo no trae el desglose.
 * Un depósito que no aparece no tiene fila de stock, que es lo mismo que cero.
 */
export interface ProductStockByWarehouse {
  productId: number
  quantities: Record<number, number>
}
