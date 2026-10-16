import type { OrderDraftItem } from 'shared/store'

import { lineSubtotal } from './payment'

// Las reglas del paso 1 del alta manual, fuera de los componentes para que se
// puedan probar sin montar la pantalla.

/**
 * Una línea válida para enviar: al menos una unidad entera y un precio mayor a
 * cero. Es lo que `Orders::CreateOrder` exige por ítem (`quantity` y
 * `unit_price` presentes) más lo que el negocio da por sentado: una venta de
 * cero unidades o a precio cero no es una venta.
 */
export function isDraftItemValid(item: Pick<OrderDraftItem, 'quantity' | 'unitPrice'>): boolean {
  return Number.isInteger(item.quantity) && item.quantity >= 1 && item.unitPrice > 0
}

// Una cantidad a medio tipear (vacía → NaN, o `null` si el borrador volvió de
// la sesión) no suma: sin esto un solo campo en blanco vuelve NaN los totales.
function countable(items: OrderDraftItem[]): OrderDraftItem[] {
  return items.filter((item) => Number.isFinite(item.quantity))
}

/** Lo que suman los productos del borrador. En centavos por debajo, como el detalle. */
export function draftSubtotal(items: OrderDraftItem[]): number {
  const cents = countable(items).reduce(
    (sum, item) => sum + Math.round(lineSubtotal(item) * 100),
    0,
  )
  return cents / 100
}

/**
 * Peso estimado del envío: el peso unitario declarado de cada SKU por su
 * cantidad. Se redondea a gramos para que 0,1 + 0,2 no dé 0,30000000000000004.
 */
export function draftWeight(items: OrderDraftItem[]): number {
  const grams = countable(items).reduce(
    (sum, item) => sum + Math.round(item.weight * 1000) * item.quantity,
    0,
  )
  return grams / 1000
}

/** Por qué las líneas del borrador todavía no alcanzan para avanzar. */
export type ItemsGap = 'noItems' | 'invalidItems'

/**
 * Lo que les falta a las líneas para que el paso 1 pueda avanzar, o `null` si
 * están listas: ninguna línea todavía, o alguna que no se puede enviar. Es la
 * mitad de `canProceed` que no es el formulario del cliente, separada para que
 * la pantalla diga cuál de las dos falla (TESIS-173).
 */
export function itemsGap(items: OrderDraftItem[]): ItemsGap | null {
  if (items.length === 0) return 'noItems'
  return items.every(isDraftItemValid) ? null : 'invalidItems'
}

/**
 * Cuándo se habilita «Siguiente»: datos del cliente válidos y al menos una
 * línea, todas válidas. Una fila con cantidad en blanco no bloquea sólo su
 * celda: bloquea el paso, porque el envío la rechazaría.
 */
export function canProceed(customerValid: boolean, items: OrderDraftItem[]): boolean {
  return customerValid && itemsGap(items) === null
}
