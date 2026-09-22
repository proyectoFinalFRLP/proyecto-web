import { useQuery } from '@tanstack/react-query'

import { fetchCatalogProducts } from '../api'
import { catalogKeys } from '../queryKeys'
import type { CatalogProduct } from '../types'

/**
 * El catálogo completo para el buscador del alta manual. Se pide una vez y el
 * filtro por SKU o nombre corre en memoria (ver `filterCatalog`): la API no
 * busca, así que un request por tecla no tendría nada que devolver distinto.
 */
export function useCatalogProducts() {
  return useQuery<CatalogProduct[]>({
    queryKey: catalogKeys.products(),
    queryFn: fetchCatalogProducts,
  })
}
