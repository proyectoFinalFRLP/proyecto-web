import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchCatalogProducts } from '../api'
import { catalogKeys } from '../queryKeys'
import type { CatalogProduct } from '../types'

/**
 * Los productos que matchean lo que se tipeó en el buscador del alta manual.
 *
 * Filtra el backend (`search` de `GET /products`, TESIS-62) y no el cliente:
 * traerse una página y filtrarla en memoria dejaba fuera del buscador a todo
 * producto más allá del corte de la API, y el operador no tenía cómo
 * distinguir «no existe» de «está más allá de la primera página».
 *
 * `keepPreviousData` es lo que evita que la lista parpadee vacía entre
 * pulsaciones: mientras llega la búsqueda nueva se siguen mostrando las
 * coincidencias de la anterior.
 */
export function useCatalogProducts(search: string) {
  // Recortado acá y no sólo al armar el request: la clave de caché se arma con
  // el mismo término que viaja, así que «cab» y «cab » son una sola entrada y
  // un solo pedido, en vez de dos que devuelven lo mismo.
  const term = search.trim()

  return useQuery<CatalogProduct[]>({
    queryKey: catalogKeys.products(term),
    queryFn: () => fetchCatalogProducts(term),
    placeholderData: keepPreviousData,
  })
}
