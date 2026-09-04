import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'

import {
  createProduct,
  fetchProduct,
  fetchProductList,
  fetchWarehouses,
  updateProduct,
} from '../api'
import { inventoryKeys } from '../queryKeys'
import type {
  CreateProductPayload,
  Product,
  ProductSummary,
  UpdateProductPayload,
  Warehouse,
} from '../types'

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
 * Alta desde el modal de creación.
 *
 * Invalida todo el dominio para que el producto nuevo aparezca en el listado
 * con su stock ya sumado, sin recargar la página.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation<Product, Error, CreateProductPayload>({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
  })
}

/**
 * Guardado del modal de edición.
 *
 * Al terminar invalida todo el dominio: el update toca cantidades de stock, así
 * que el `total_stock` del listado también quedó viejo, no sólo el detalle.
 */
export function useUpdateProduct(id: number | undefined, version: string | null) {
  const queryClient = useQueryClient()

  return useMutation<Product, ApiRequestError, UpdateProductPayload>({
    mutationFn: (payload) => updateProduct(id ?? 0, payload, version),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
  })
}

/** La API rechaza con 412 el guardado que parte de una versión vieja. */
export const CONFLICT_STATUS = 412
