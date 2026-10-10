// Factory de query keys de la feature — nunca literales sueltos en los hooks,
// así las invalidaciones no se desincronizan cuando aparecen más mutaciones.

import type { ProductFilters } from './types'

export const inventoryKeys = {
  all: ['inventory'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  productList: (filters: ProductFilters) => [...inventoryKeys.products(), 'list', filters] as const,
  // Una sola clave para los cuatro contadores: desde TESIS-162 vienen en una
  // respuesta, así que tampoco hay cuatro cachés que puedan quedar desparejas.
  counts: (search: string, category: string) =>
    [...inventoryKeys.products(), 'counts', search, category] as const,
  product: (id: number) => [...inventoryKeys.products(), 'detail', id] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  mappings: (productId: number) => [...inventoryKeys.product(productId), 'mappings'] as const,
}
