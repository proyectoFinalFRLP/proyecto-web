import { useQueries } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { fetchProductStocks } from '../api'
import { catalogKeys } from '../queryKeys'
import type { ProductStockByWarehouse } from '../types'

export interface ProductStocks {
  stocks: ProductStockByWarehouse[]
  isPending: boolean
  isError: boolean
  refetch: () => void
}

/**
 * El stock por depósito de un grupo de productos: los del borrador en el paso 2
 * del alta (qué depósito puede despachar la orden entera) y los de una orden en
 * su modificación (si el depósito de cada línea alcanza para lo que se pide).
 *
 * Un request por producto, en paralelo: el listado del catálogo no trae el
 * desglose por depósito y no hay un endpoint que lo dé para varios productos a
 * la vez. Una orden tiene pocas líneas, así que son pocos requests, y la
 * caché los reusa si el operador va y vuelve entre pasos.
 */
export function useProductStocks(productIds: number[]): ProductStocks {
  return useQueries({
    queries: productIds.map((productId) => ({
      queryKey: catalogKeys.productStocks(productId),
      queryFn: () => fetchProductStocks(productId),
    })),
    combine: combineStocks,
  })
}

// A nivel de módulo y no inline: con una referencia estable, TanStack reusa el
// resultado mientras las queries no cambien, y el cálculo de cobertura de la
// página no se rehace en cada render.
function combineStocks(results: UseQueryResult<ProductStockByWarehouse>[]): ProductStocks {
  return {
    stocks: results.flatMap((result) => (result.data === undefined ? [] : [result.data])),
    isPending: results.some((result) => result.isPending),
    isError: results.some((result) => result.isError),
    refetch: () => {
      results.filter((result) => result.isError).forEach((result) => void result.refetch())
    },
  }
}
