import type {
  OrderDraftCustomer,
  OrderDraftDestination,
  OrderDraftItem,
  OrderDraftOrigin,
} from 'shared/store'

import type { ProductStockByWarehouse } from '../types'

// Las reglas del paso 2 del alta manual (S06), fuera de los componentes para
// probarlas sin montar la pantalla: qué depósito cubre el borrador y cómo se
// arman los dos requests que va a hacer el paso 3 con lo que se eligió acá.

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

/**
 * Lo que el paso 3 manda a `POST /api/v1/orders/:id/quotes`, una vez creada la
 * orden. El destino no viaja: la cotización lo lee de la orden (código postal y
 * dirección), así que lo único que falta decirle es de dónde sale el paquete.
 */
export function toQuotePayload(origin: OrderDraftOrigin) {
  return { quote: { origin_warehouse_id: origin.warehouseId } }
}
