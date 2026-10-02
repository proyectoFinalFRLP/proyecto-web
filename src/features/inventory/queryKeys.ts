// Factory de query keys de la feature — nunca literales sueltos en los hooks,
// así las invalidaciones no se desincronizan cuando aparecen más mutaciones.

import type { ProductCategory, ProductFilters, StockStatus } from './types'

export const inventoryKeys = {
  all: ['inventory'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  productList: (filters: ProductFilters) => [...inventoryKeys.products(), 'list', filters] as const,
  counts: () => [...inventoryKeys.products(), 'count'] as const,
  // `status ?? 'all'`: sin esto, la clave de «todos» y la de un estado
  // indefinido serían la misma sólo por casualidad de serialización.
  count: (status: StockStatus | undefined, search: string, category?: ProductCategory) =>
    [...inventoryKeys.counts(), status ?? 'all', search, category ?? 'any'] as const,
  product: (id: number) => [...inventoryKeys.products(), 'detail', id] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
}
