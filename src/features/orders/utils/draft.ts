import type { OrderDraftItem } from 'shared/store'

import type { CatalogProduct } from '../types'

import { lineSubtotal } from './payment'

// Las reglas del paso 1 del alta manual, fuera de los componentes para que se
// puedan probar sin montar la pantalla.

/**
 * Los productos cuyo SKU o nombre contienen el término, sin distinguir
 * mayúsculas. Con el término vacío devuelve el catálogo entero: el buscador
 * recién abierto muestra todo, no nada.
 */
export function filterCatalog(products: CatalogProduct[], term: string): CatalogProduct[] {
  const needle = term.trim().toLowerCase()
  if (needle === '') return products

  return products.filter(
    (product) =>
      product.sku.toLowerCase().includes(needle) || product.name.toLowerCase().includes(needle),
  )
}

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

/**
 * Cuándo se habilita «Siguiente»: datos del cliente válidos y al menos una
 * línea, todas válidas. Una fila con cantidad en blanco no bloquea sólo su
 * celda: bloquea el paso, porque el envío la rechazaría.
 */
export function canProceed(customerValid: boolean, items: OrderDraftItem[]): boolean {
  return customerValid && items.length > 0 && items.every(isDraftItemValid)
}
