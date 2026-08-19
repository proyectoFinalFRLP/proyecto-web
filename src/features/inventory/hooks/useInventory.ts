import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchProduct, fetchProductList, fetchWarehouses, updateProduct } from '../api'
import { inventoryKeys } from '../queryKeys'
import type { Product, ProductSummary, UpdateProductPayload, Warehouse } from '../types'

/** Listado paginado del catálogo. Sin `stocks` — ver `ProductSummary`. */
export function useProductList(page = 1, perPage = 20) {
  return useQuery<ProductSummary[]>({
    queryKey: inventoryKeys.productList(page, perPage),
    queryFn: () => fetchProductList(page, perPage),
  })
}

/** Detalle de un producto, con su desglose de stock por depósito. */
export function useProduct(id: number | undefined) {
  return useQuery<Product>({
    queryKey: inventoryKeys.product(id ?? 0),
    queryFn: () => fetchProduct(id ?? 0),
    // Sin id todavía (el listado no resolvió) la query no se dispara.
    enabled: id !== undefined,
  })
}

/** Depósitos de la empresa — alimentan "Agregar depósito" en el modal. */
export function useWarehouses() {
  return useQuery<Warehouse[]>({
    queryKey: inventoryKeys.warehouses(),
    queryFn: fetchWarehouses,
  })
}

/**
 * Guardado del modal de edición.
 *
 * Al terminar invalida todo el dominio: el update toca cantidades de stock, así
 * que el `total_stock` del listado también quedó viejo, no sólo el detalle.
 */
export function useUpdateProduct(id: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation<Product, Error, UpdateProductPayload>({
    mutationFn: (payload) => updateProduct(id ?? 0, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
  })
}
