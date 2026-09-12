import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'

import {
  createProduct,
  fetchProduct,
  deleteProduct,
  fetchProductCount,
  fetchProductPage,
  fetchWarehouses,
  updateProduct,
} from '../api'
import { inventoryKeys } from '../queryKeys'
import type {
  CreateProductPayload,
  Product,
  ProductFilters,
  ProductPage,
  StockStatus,
  UpdateProductPayload,
  Warehouse,
} from '../types'

/**
 * Las pestañas del catálogo, en el orden del diseño, con el estado que filtra
 * cada una. Es una sola lista y no dos arrays paralelos: los contadores se
 * piden en este mismo orden y se leen por índice.
 */
export const CATALOG_TABS = [
  { id: 'all', status: undefined },
  { id: 'available', status: 'available' },
  { id: 'low', status: 'low' },
  { id: 'out_of_stock', status: 'out_of_stock' },
] as const satisfies readonly { id: string; status: StockStatus | undefined }[]

export type CatalogTabId = (typeof CATALOG_TABS)[number]['id']

/**
 * Una página del catálogo. Sin `stocks` — ver `ProductSummary`.
 *
 * `keepPreviousData` es lo que evita que cambiar de página vacíe la tabla: sin
 * esto el cuerpo queda en blanco hasta que responde la API y la pantalla salta
 * de alto en cada click.
 */
export function useProductPage(filters: ProductFilters) {
  return useQuery<ProductPage>({
    queryKey: inventoryKeys.productList(filters),
    queryFn: () => fetchProductPage(filters),
    placeholderData: keepPreviousData,
  })
}

/**
 * Los cuatro contadores de las pestañas, en paralelo. Son consultas de una sola
 * fila que leen nada más que el `meta.total`.
 *
 * Respetan la búsqueda: si no lo hicieran, buscar algo inexistente dejaría la
 * tabla vacía con una pestaña que sigue diciendo «Todos (1.284)».
 */
export function useProductCounts(search: string) {
  return useQueries({
    queries: CATALOG_TABS.map(({ status }) => ({
      queryKey: inventoryKeys.count(status, search),
      queryFn: () => fetchProductCount(status, search),
    })),
    // Un contador que falla no puede voltear la pantalla: la tabla se ve igual
    // y la pestaña queda sin número.
    combine: (results) => results.map((result) => result.data),
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

/** Status con el que el backend rechaza borrar un producto con historia. */
export const RESTRICTED_STATUS = 409

/**
 * Baja del catálogo. Invalida todo el dominio: la fila desaparece del listado y
 * los contadores de las pestañas se recalculan sin recargar la página.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiRequestError, number>({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
  })
}
