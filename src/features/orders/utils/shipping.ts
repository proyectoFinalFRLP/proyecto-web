import type {
  OrderDraftCustomer,
  OrderDraftDestination,
  OrderDraftItem,
  OrderDraftOrigin,
} from 'shared/store'

import type { ProductStockByWarehouse, ShippingQuote } from '../types'

// Las reglas del envío en el alta manual, fuera de los componentes para
// probarlas sin montar las pantallas: qué depósito cubre el borrador (paso 2,
// S06) y cómo se arman los requests del paso 3 (S07): cotizar el borrador,
// crear la orden y despachar la opción elegida.

/** Cómo cubre un depósito las líneas del borrador. */
export type CoverageLevel = 'full' | 'partial' | 'none'

export interface WarehouseCoverage {
  level: CoverageLevel
  /** SKU cuyas unidades el depósito no alcanza a cubrir, en el orden del borrador. */
  missing: string[]
  /** Cantidad de líneas del borrador. */
  total: number
}

/**
 * Si un depósito puede despachar el borrador entero.
 *
 * La orden sale de un solo depósito —el paso 3 manda el mismo `warehouse_id` en
 * cada línea, y `Orders::CreateOrder` descuenta de ése—, así que alcanza con que
 * falte una línea para que el alta responda 422. Por eso sólo `full` habilita a
 * elegirlo: es la validación preventiva que pide la card, en el paso en el que
 * todavía se puede cambiar de depósito.
 *
 * Una línea sin stock cargado para el depósito cuenta como cero: es lo que hace
 * el backend cuando no encuentra la fila de `stocks`.
 *
 * **Precondición: una línea por producto.** Cada línea se compara por separado
 * contra el stock de su producto, así que dos líneas del mismo SKU pasarían las
 * dos aunque juntas no entren. El borrador lo cumple porque `addItem` reemplaza
 * la línea del mismo `productId` en vez de agregar otra; si eso cambiara, acá
 * habría que sumar por producto antes de comparar.
 */
export function warehouseCoverage(
  warehouseId: number,
  items: OrderDraftItem[],
  stocks: ProductStockByWarehouse[],
): WarehouseCoverage {
  const byProduct = new Map(stocks.map((stock) => [stock.productId, stock.quantities]))
  const missing = items
    .filter((item) => (byProduct.get(item.productId)?.[warehouseId] ?? 0) < item.quantity)
    .map((item) => item.sku)

  return { level: coverageLevel(missing.length, items.length), missing, total: items.length }
}

function coverageLevel(missingCount: number, total: number): CoverageLevel {
  if (missingCount === 0) return 'full'
  return missingCount === total ? 'none' : 'partial'
}

/** Lo que el paso 3 manda a `POST /api/v1/orders` para crear la orden. */
export interface CreateOrderPayload {
  order: {
    customer_name: string
    customer_document: string
    customer_address: string
    customer_city: string
    customer_province: string
    customer_zip_code: string
    items: {
      product_id: number
      warehouse_id: number
      quantity: number
      unit_price: number
    }[]
  }
}

/**
 * El alta de la orden con todo lo que juntaron los pasos 1 y 2. El depósito de
 * origen viaja en cada línea: la API lo pide por ítem aunque el asistente elige
 * uno solo para toda la orden. Nombre y apellido se unen en el `customer_name`
 * que espera la API, y los textos se recortan para no guardar espacios sueltos.
 */
export function toCreateOrderPayload(
  customer: OrderDraftCustomer,
  items: OrderDraftItem[],
  origin: OrderDraftOrigin,
  destination: OrderDraftDestination,
): CreateOrderPayload {
  return {
    order: {
      customer_name: `${customer.firstName.trim()} ${customer.lastName.trim()}`,
      customer_document: customer.document.trim(),
      customer_address: destination.address.trim(),
      customer_city: destination.city.trim(),
      customer_province: destination.province,
      customer_zip_code: destination.zipCode.trim(),
      items: items.map((item) => ({
        product_id: item.productId,
        warehouse_id: origin.warehouseId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    },
  }
}

/** Lo que el paso 3 manda a `POST /api/v1/quotes` para cotizar el borrador. */
export interface DraftQuotePayload {
  quote: {
    origin_warehouse_id: number
    destination_zip_code: string
    destination_address: string
    items: { product_id: number; quantity: number }[]
  }
}

/**
 * La cotización del borrador, antes de que la orden exista (TESIS-131).
 *
 * Viaja qué lleva el paquete y no cuánto pesa: el peso lo calcula el backend con
 * el de cada producto, que es su dato. Así cotizar no crea la orden ni descuenta
 * stock; eso pasa una sola vez, cuando el operador confirma.
 */
export function toDraftQuotePayload(
  items: OrderDraftItem[],
  origin: OrderDraftOrigin,
  destination: OrderDraftDestination,
): DraftQuotePayload {
  return {
    quote: {
      origin_warehouse_id: origin.warehouseId,
      destination_zip_code: destination.zipCode.trim(),
      destination_address: destination.address.trim(),
      items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    },
  }
}

/** Lo que el paso 3 manda a `POST /api/v1/shipments/:id/dispatch`. */
export interface DispatchPayload {
  dispatch: {
    company_integration_id: number
    origin_warehouse_id: number
    shipping_cost: number
  }
}

/**
 * El despacho de la opción elegida. La integración es la que **despacha**
 * (`dispatchIntegrationId`), no la que contestó la tarifa: son dos plantillas
 * del mismo courier, y el despacho rechaza la de cotización. El costo viaja
 * para que quede en el envío, que es de donde lo lee el detalle de la orden.
 */
export function toDispatchPayload(quote: ShippingQuote, origin: OrderDraftOrigin): DispatchPayload {
  return {
    dispatch: {
      company_integration_id: quote.dispatchIntegrationId,
      origin_warehouse_id: origin.warehouseId,
      shipping_cost: quote.shippingCost,
    },
  }
}

/**
 * El total final del paso 3: productos más el envío elegido. En centavos, como
 * el resto de las cuentas de la feature. Sin envío elegido todavía, el total es
 * lo que se sabe: los productos.
 */
export function totalWithShipping(subtotal: number, shippingCost: number | null): number {
  const shippingCents = shippingCost === null ? 0 : Math.round(shippingCost * 100)
  return (Math.round(subtotal * 100) + shippingCents) / 100
}
