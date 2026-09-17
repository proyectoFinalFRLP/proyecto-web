import type { StatusVariant } from 'shared/components'

import type { ProductStock } from '../types'

// Derivaciones de stock del detalle de producto. Funciones puras y aparte del
// componente porque concentran las reglas que NO se ven en el diseño — mismo
// criterio que `utils/payload.ts`.
//
// ⚠️ Qué expone hoy la API y qué no
//
// `GET /api/v1/products/:id` devuelve un único número por depósito
// (`stocks[].quantity`): las unidades **en depósito**. No hay reservas, ni
// mercadería en tránsito, ni umbral máximo por producto.
//
// El diseño de S12 muestra el total repartido en tres cubetas —comprometido,
// en tránsito y disponible para prometer— que suman el on hand (4.280 =
// 1.120 + 450 + 2.710). Ninguna de las tres se puede calcular con lo que hay:
// dar comprometido = 0 diría "no hay nada reservado" cuando en realidad el
// modelo no lo registra, que es la misma clase de error que usar `updated_at`
// como marca de sincronización. Por eso el desglose se muestra sin dato.

/**
 * Umbrales de nivel de stock, en unidades.
 *
 * **Provisorios.** La regla de negocio real es un punto de reposición por
 * producto (o por producto y depósito) que el backend todavía no modela; hasta
 * que exista, estos dos números son la única forma de que el badge de estado
 * diga algo. Los valores salen de las cantidades del propio diseño, donde 420
 * es "Stock bajo" y 200 "Crítico".
 *
 * Mismo patrón que `SYNC_STALE_THRESHOLD_MS` en el dashboard: constante con
 * nombre y comentario, para que el día que llegue el dato real haya un solo
 * lugar que tocar.
 */
export const LOW_STOCK_UNITS = 500
export const CRITICAL_STOCK_UNITS = 200

/** Nivel de disponibilidad de una posición de stock. */
export type StockLevel = 'available' | 'low' | 'critical' | 'out'

/** Tono semántico del badge por nivel. El color nunca va solo: siempre con texto. */
export const STOCK_LEVEL_STATUS: Record<StockLevel, StatusVariant> = {
  available: 'success',
  low: 'warning',
  critical: 'error',
  out: 'error',
}

/** Unidades en depósito sumando todas las posiciones del producto. */
export function totalOnHand(stocks: ProductStock[]): number {
  return stocks.reduce((total, stock) => total + stock.quantity, 0)
}

/** Nivel de una cantidad contra los umbrales provisorios de arriba. */
export function stockLevel(quantity: number): StockLevel {
  if (quantity <= 0) return 'out'
  if (quantity <= CRITICAL_STOCK_UNITS) return 'critical'
  if (quantity <= LOW_STOCK_UNITS) return 'low'
  return 'available'
}

/**
 * Posiciones ordenadas de mayor a menor cantidad, como en el diseño.
 *
 * Copia el array antes de ordenar: `sort` muta, y el array llega desde la caché
 * de React Query, que es estructura compartida entre todos sus consumidores.
 */
export function sortByQuantityDesc(stocks: ProductStock[]): ProductStock[] {
  return [...stocks].sort((a, b) => b.quantity - a.quantity)
}
