// Factory de query keys de la feature — nunca literales sueltos en los hooks,
// así las invalidaciones no se desincronizan cuando aparecen más mutaciones.

import type { ProductFilters, StockStatus } from './types'

export const inventoryKeys = {
  all: ['inventory'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  productList: (filters: ProductFilters) => [...inventoryKeys.products(), 'list', filters] as const,
  counts: () => [...inventoryKeys.products(), 'count'] as const,
  // `status ?? 'all'`: sin esto, la clave de «todos» y la de un estado
  // indefinido serían la misma sólo por casualidad de serialización.
  count: (status: StockStatus | undefined, search: string) =>
    [...inventoryKeys.counts(), status ?? 'all', search] as const,
  product: (id: number) => [...inventoryKeys.products(), 'detail', id] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
  // Cuelga de `all` y no de `product(id)`: las mutaciones de stock invalidan
  // `all`, y una transferencia nueva tiene que aparecer en esta lista también.
  transfers: (productId: number) => [...inventoryKeys.all, 'transfers', productId] as const,
}
