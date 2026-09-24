import { client } from 'shared/api/client'
import { fetchCount } from 'shared/api/count'

import type {
  CatalogProduct,
  Courier,
  OrderDetail,
  OrderFilters,
  OrderPage,
  OrderShipment,
  OrderStatus,
  OrderSummary,
  OriginWarehouse,
  ProductStockByWarehouse,
  Shipment,
  ShipmentStatus,
  UpdateOrderPayload,
} from './types'

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

interface ApiCatalogProduct {
  id: number
  sku: string
  name: string
  category: string | null
  weight: number
  total_stock: number
}

interface ApiListMeta {
  page: number
  per_page: number
  total: number
}

interface ApiOrderList {
  data: ApiOrderSummary[]
  meta: ApiListMeta
}

interface ApiOrderItem {
  id: number
  product_id: number
  quantity: number
  unit_price: number
  warehouse_id: number | null
  product: { id: number; sku: string; name: string }
}

// `show` devuelve el objeto pelado, sin el envoltorio `{ data }` del listado.
interface ApiOrderDetail {
  id: number
  external_order_id: string | null
  customer_name: string
  customer_document: string | null
  customer_address: string | null
  customer_zip_code: string | null
  customer_city: string | null
  customer_province: string | null
  status: OrderStatus
  total_amount: number | null
  order_items: ApiOrderItem[]
  created_at: string
}

interface ApiShipmentEvent {
  id: number
  internal_status: ShipmentStatus
  external_status: string
  description: string | null
  occurred_at: string
}

interface ApiShipment {
  id: number
  order_id: number
  status: ShipmentStatus
  tracking_number: string | null
  shipping_cost: number | null
  courier: ApiCourier | null
  events: ApiShipmentEvent[]
}

// La fila del listado de envíos: sólo se lee para saber cuántos hay y cuál es.
interface ApiShipmentList {
  data: { id: number }[]
  meta: ApiListMeta
}

function toCourier(courier: ApiCourier | null): Courier | null {
  if (courier === null) return null

  return { id: courier.id, serviceId: courier.service_id, name: courier.name }
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
function toFilters({ status, search }: Pick<OrderFilters, 'status' | 'search'>) {
  return {
    ...(status === undefined ? {} : { status }),
    ...(search === undefined || search === '' ? {} : { search }),
  }
}

function toParams({ page, perPage, status, search }: OrderFilters) {
  return { page, per_page: perPage, ...toFilters({ status, search }) }
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

function toOrderDetail(data: ApiOrderDetail, version: string | null): OrderDetail {
  return {
    id: data.id,
    externalOrderId: data.external_order_id,
    customerName: data.customer_name,
    customerDocument: data.customer_document,
    customerAddress: data.customer_address,
    customerZipCode: data.customer_zip_code,
    customerCity: data.customer_city,
    customerProvince: data.customer_province,
    status: data.status,
    version,
    totalAmount: data.total_amount,
    lines: data.order_items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      sku: item.product.sku,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      warehouseId: item.warehouse_id,
    })),
    createdAt: data.created_at,
  }
}

// El ETag viene entrecomillado y puede traer el prefijo débil `W/`. Se guarda
// tal cual llegó —es opaco para el front— y se devuelve sin tocar en `If-Match`.
// Mismo criterio que `features/inventory/api.ts`.
function readVersion(etag: unknown): string | null {
  return typeof etag === 'string' && etag.length > 0 ? etag : null
}

export async function fetchOrder(id: number): Promise<OrderDetail> {
  const response = await client.get<ApiOrderDetail>(`/orders/${id}`)

  return toOrderDetail(response.data, readVersion(response.headers.etag))
}

/**
 * Guarda la modificación de una orden (TESIS-126).
 *
 * Con versión viaja `If-Match`, y el backend responde 412 si otro operador
 * cambió la orden desde que se leyó. La respuesta trae la orden como quedó, con
 * su versión nueva.
 */
export async function updateOrder(
  id: number,
  payload: UpdateOrderPayload,
  version: string | null,
): Promise<OrderDetail> {
  const response = await client.put<ApiOrderDetail>(`/orders/${id}`, payload, {
    // Sin versión no se manda el header: `If-Match` ausente significa "sin
    // precondición", no "versión vacía".
    headers: version === null ? undefined : { 'If-Match': version },
  })

  return toOrderDetail(response.data, readVersion(response.headers.etag))
}

function toShipment(shipment: ApiShipment): Shipment {
  return {
    id: shipment.id,
    orderId: shipment.order_id,
    status: shipment.status,
    trackingNumber: shipment.tracking_number,
    shippingCost: shipment.shipping_cost,
    courier: toCourier(shipment.courier),
    // El backend ya los ordena por `occurred_at` (con desempate por id): no se
    // reordenan acá para no tener dos definiciones del mismo orden.
    events: shipment.events.map((event) => ({
      id: event.id,
      internalStatus: event.internal_status,
      externalStatus: event.external_status,
      description: event.description,
      occurredAt: event.occurred_at,
    })),
  }
}

/**
 * El envío de una orden, con su bitácora.
 *
 * Son dos requests porque la API no anida el envío en la orden: el listado
 * filtrado por `order_id` dice cuántos hay y cuál es, y el detalle trae los
 * eventos, que el listado no incluye.
 *
 * Se piden dos filas y no una a propósito: con `per_page=1` un segundo envío
 * quedaría fuera de la página, y el `meta.total` es lo que lo delata.
 */
export async function fetchOrderShipment(orderId: number): Promise<OrderShipment> {
  const { data: list } = await client.get<ApiShipmentList>('/shipments', {
    params: { order_id: orderId, page: 1, per_page: 2 },
  })

  if (list.meta.total > 1) return { kind: 'duplicated', count: list.meta.total }

  if (list.data.length === 0) return { kind: 'none' }

  const { data } = await client.get<ApiShipment>(`/shipments/${list.data[0].id}`)

  return { kind: 'single', shipment: toShipment(data) }
}

/**
 * Cuántas órdenes matchean un filtro, sin traerlas.
 *
 * Alimenta los contadores de las pestañas. Lee sólo el `meta.total` del scope
 * filtrado (ver `fetchCount`): es el mismo truco que usan los KPIs del tablero
 * y evita traer cuatro páginas completas para mostrar cuatro números.
 */
export function fetchOrderCount(status?: OrderStatus, search?: string): Promise<number> {
  return fetchCount('/orders', toFilters({ status, search }))
}

/**
 * Cuántas coincidencias muestra el buscador del alta manual.
 *
 * Ya no es «el catálogo entero»: desde TESIS-62 el backend filtra, así que lo
 * que llega son los productos que matchean lo tipeado, y veinte alcanzan de
 * sobra para elegir uno. Antes se pedían cien y se filtraba en memoria, y un
 * catálogo más grande dejaba productos que el buscador no encontraba nunca,
 * sin que el operador pudiera distinguirlo de «no existe».
 */
export const CATALOG_MATCHES = 20

/**
 * Los productos que matchean el término, para el buscador del alta manual.
 *
 * Con el término vacío devuelve la primera página: el buscador recién abierto
 * muestra algo en vez de nada, y el operador acota tipeando.
 */
export async function fetchCatalogProducts(search: string): Promise<CatalogProduct[]> {
  const term = search.trim()
  const { data } = await client.get<{ data: ApiCatalogProduct[]; meta: ApiListMeta }>('/products', {
    // Un `search` vacío no viaja: el backend lo trataría como un filtro por
    // cadena vacía. Mismo criterio que `toFilters` del listado de órdenes.
    params: { page: 1, per_page: CATALOG_MATCHES, ...(term === '' ? {} : { search: term }) },
  })

  return data.data.map((product) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    weight: product.weight,
    totalStock: product.total_stock,
  }))
}

interface ApiWarehouse {
  id: number
  name: string
  address: string
  zip_code: string
}

// `show` de productos devuelve el objeto pelado. Del detalle sólo interesa el
// desglose de stock: el resto ya lo copió el borrador en el paso 1.
interface ApiProductStocks {
  id: number
  stocks: { warehouse_id: number; quantity: number }[]
}

/** Los depósitos de la empresa, para elegir el origen en el paso 2. */
export async function fetchWarehouses(): Promise<OriginWarehouse[]> {
  const { data } = await client.get<{ data: ApiWarehouse[] }>('/warehouses')

  return data.data.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    address: warehouse.address,
    zipCode: warehouse.zip_code,
  }))
}

/**
 * El stock de un producto en cada depósito. Es un request por producto porque
 * el listado del catálogo no trae el desglose (`ProductListSerializer`), y el
 * paso 2 necesita saber qué depósito cubre cada línea del borrador.
 */
export async function fetchProductStocks(productId: number): Promise<ProductStockByWarehouse> {
  const { data } = await client.get<ApiProductStocks>(`/products/${productId}`)

  return {
    productId: data.id,
    quantities: Object.fromEntries(
      data.stocks.map((stock) => [stock.warehouse_id, stock.quantity]),
    ),
  }
}

/**
 * Las provincias que acepta el alta (`Order::PROVINCES`, TESIS-128). Se leen del
 * backend y no se escriben acá porque tienen que coincidir carácter por
 * carácter, tildes incluidas: una provincia mal escrita es un 422 al confirmar.
 */
export async function fetchProvinces(): Promise<string[]> {
  const { data } = await client.get<{ data: string[] }>('/orders/provinces')

  return data.data
}
