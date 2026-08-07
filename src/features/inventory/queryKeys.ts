// Factory de query keys de la feature — nunca literales sueltos en los hooks,
// así las invalidaciones no se desincronizan cuando aparecen más mutaciones.

export const inventoryKeys = {
  all: ['inventory'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  productList: (page: number, perPage: number) =>
    [...inventoryKeys.products(), 'list', { page, perPage }] as const,
  product: (id: number) => [...inventoryKeys.products(), 'detail', id] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
}
