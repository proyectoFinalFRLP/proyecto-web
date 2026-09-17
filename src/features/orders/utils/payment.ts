import type { OrderDetail, OrderLine } from '../types'

// Las cuentas del detalle de la orden. Se hacen en centavos: sumar importes en
// punto flotante deja restos como 188.84100000000001 que el formato disimula
// en pantalla pero no en una comparación.

function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/** Importe de una línea: precio facturado por cantidad. */
export function lineSubtotal(line: OrderLine): number {
  return toCents(line.unitPrice * line.quantity) / 100
}

/** Unidades vendidas, sumando todas las líneas. */
export function totalUnits(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export interface PaymentSummary {
  /** Lo facturado por los productos. */
  subtotal: number
  /** El costo del envío, o null si todavía no se cotizó. */
  shipping: number | null
  /** Productos más envío. Sin envío cotizado, es el subtotal. */
  total: number
}

/**
 * El resumen de pago del detalle, con el desglose del diseño: productos, envío
 * y total.
 *
 * El subtotal es el `total_amount` persistido y no la suma de las líneas
 * recalculada: es el registro de lo que se facturó (TESIS-114), y el mismo
 * número que muestra el listado. Sólo las órdenes anteriores a esa card, que
 * no lo tienen, caen a sumar las líneas.
 *
 * El envío se suma sólo si está cotizado. Un envío sin costo no cuesta 0: se
 * muestra como pendiente y el total queda en lo que se sabe.
 */
export function paymentSummary(order: OrderDetail, shippingCost: number | null): PaymentSummary {
  const subtotalCents =
    order.totalAmount === null
      ? order.lines.reduce((sum, line) => sum + toCents(lineSubtotal(line)), 0)
      : toCents(order.totalAmount)
  const shippingCents = shippingCost === null ? 0 : toCents(shippingCost)

  return {
    subtotal: subtotalCents / 100,
    shipping: shippingCost,
    total: (subtotalCents + shippingCents) / 100,
  }
}
