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
  quantity: number
  /** Unidades en vuelo hacia este depósito. */
  incoming: number
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
    product.inTransitByWarehouse.map((transit) => [transit.warehouseId, transit]),
  )

  const stocked = sortByQuantityDesc(product.stocks).map((stock) => ({
    warehouseId: stock.warehouseId,
    name: stock.warehouse.name,
    location: stock.warehouse.address,
    quantity: stock.quantity,
    incoming: incoming.get(stock.warehouseId)?.quantity ?? 0,
    stockStatus: stock.stockStatus,
  }))

  const stockedIds = new Set(product.stocks.map((stock) => stock.warehouseId))
  const onlyIncoming = product.inTransitByWarehouse
    .filter((transit) => !stockedIds.has(transit.warehouseId))
    .map((transit) => ({
      warehouseId: transit.warehouseId,
      name: transit.name,
      location: null,
      quantity: 0,
      incoming: transit.quantity,
      stockStatus: 'out_of_stock' as const,
    }))

  return [...stocked, ...onlyIncoming]
}
