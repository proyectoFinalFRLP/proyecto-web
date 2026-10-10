import type { Product, ProductStock, StockStatus } from '../types'

// Derivaciones de stock del detalle de producto. Funciones puras y aparte del
// componente porque concentran las reglas que NO se ven en el diseño — mismo
// criterio que `utils/payload.ts`.
//
// ⚠️ Qué expone hoy la API y qué no
//
// `GET /api/v1/products/:id` devuelve, por depósito, las unidades **en
// depósito** (`stocks[].quantity`) con su estado ya calculado, y aparte las
// unidades **entrantes** de cada depósito (`in_transit_by_warehouse`). No hay
// reservas ni umbral máximo por producto.
//
// El diseño de S12 muestra el total repartido en tres cubetas —comprometido,
// en tránsito y disponible para prometer— que suman el on hand (4.280 =
// 1.120 + 450 + 2.710). Con el modelo actual eso no se cumple: el en tránsito
// está FUERA del total (salió del origen y no llegó al destino), y comprometido
// y disponible para prometer no se pueden calcular. Dar comprometido = 0 diría
// "no hay nada reservado" cuando en realidad el modelo no lo registra. Por eso
// esas dos se muestran sin dato.
//
// El estado de disponibilidad NO se calcula acá: lo manda el backend, que es
// donde vive el umbral (ver `utils/stockStatus.ts`).

/** Una fila de la distribución por depósito, antes de formatear. */
export interface DistributionPosition {
  warehouseId: number
  name: string
  /** `null` si el depósito sólo aparece por unidades entrantes (sin fila de stock). */
  location: string | null
  /** Libres: lo que queda en `stocks` después de descontar lo vendido. */
  quantity: number
  /** Unidades en vuelo hacia este depósito. */
  incoming: number
  /** Vendido y todavía en este depósito, sin despachar (TESIS-162). */
  committed: number
  /**
   * Lo que hay físicamente en el estante: libres más comprometidas.
   *
   * Es la misma definición que el encabezado de la pantalla —«En depósito
   * (físico)» de TESIS-162— y por eso las filas suman el titular. Mostrar acá
   * sólo las libres hacía que la columna y el encabezado usaran la misma
   * palabra para dos cosas distintas, y las filas no cerraban: 40 contra 44.
   */
  onHand: number
  stockStatus: StockStatus
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

/**
 * Filas de la distribución: cada depósito con stock, con sus entrantes, y al
 * final los que sólo reciben unidades.
 *
 * Un depósito que espera una transferencia puede no tener fila en `stocks`: la
 * API la crea recién cuando la transferencia se recibe. Se lo muestra igual,
 * con cero en depósito, porque esconderlo haría desaparecer de la tabla las
 * unidades que viajan hacia él. Su estado es `out_of_stock`, que es lo que el
 * backend responde para cero unidades: no es una regla nueva, es el único
 * valor posible sin fila.
 */
export function distributionPositions(product: Product): DistributionPosition[] {
  const incoming = new Map(
    product.inTransitByWarehouse.map((transit) => [transit.warehouseId, transit.quantity]),
  )
  const stocked = sortByQuantityDesc(product.stocks).map((stock) => ({
    warehouseId: stock.warehouseId,
    name: stock.warehouse.name,
    location: stock.warehouse.address,
    quantity: stock.quantity,
    incoming: incoming.get(stock.warehouseId) ?? 0,
    committed: stock.committed,
    onHand: stock.quantity + stock.committed,
    stockStatus: stock.stockStatus,
  }))

  // Un depósito sin fila de stock entra igual si tiene unidades en camino o
  // vendidas sin despachar. Esconderlo haría desaparecer de la tabla unidades
  // que existen: las que viajan hacia él y las que están en su estante
  // esperando el despacho.
  const stockedIds = new Set(product.stocks.map((stock) => stock.warehouseId))
  const sinFila = new Map<number, { name: string; incoming: number; committed: number }>()
  for (const transit of product.inTransitByWarehouse) {
    if (stockedIds.has(transit.warehouseId)) continue
    sinFila.set(transit.warehouseId, {
      name: transit.name,
      incoming: transit.quantity,
      committed: 0,
    })
  }
  for (const row of product.committedByWarehouse) {
    if (stockedIds.has(row.warehouseId)) continue
    const previo = sinFila.get(row.warehouseId)
    sinFila.set(row.warehouseId, {
      name: row.name,
      incoming: previo?.incoming ?? 0,
      committed: row.quantity,
    })
  }

  const soloEnCamino = [...sinFila].map(([warehouseId, fila]) => ({
    warehouseId,
    name: fila.name,
    location: null,
    quantity: 0,
    incoming: fila.incoming,
    committed: fila.committed,
    // Sin fila de stock no quedan libres, pero lo vendido sin despachar sigue
    // en el estante: ése es todo su físico.
    onHand: fila.committed,
    stockStatus: 'out_of_stock' as const,
  }))

  return [...stocked, ...soloEnCamino]
}
