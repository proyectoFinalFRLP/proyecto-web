import { client } from './client'

// Lo único que se lee de un listado paginado cuando sólo importa cuántos hay.
// La forma es la de los index de Rails: `{ data: [...], meta: { total } }`.
interface CountedList {
  meta: { total: number }
}

/**
 * Filtros que viajan como query params. Un valor `undefined` no viaja (Axios lo
 * omite), así que quien llama puede pasar un filtro opcional sin ramificar.
 */
export type CountFilters = Record<string, string | number | undefined>

/**
 * Cuántos registros matchean un filtro en un listado paginado, sin traerlos.
 *
 * Pide una sola fila y lee nada más que `meta.total`, que en la API cuenta el
 * scope **ya filtrado** y no la tabla entera (TESIS-112 y TESIS-113 lo fijan
 * con spec). Un request por número, sin filas.
 *
 * Es la única forma correcta de contar contra estos endpoints: un `.length`
 * sobre la respuesta cuenta la página, no el total, y cambia al paginar. Lo
 * usan los contadores de las pestañas del listado de órdenes y los KPIs del
 * panel de operación.
 */
export async function fetchCount(endpoint: string, filters: CountFilters = {}): Promise<number> {
  const { data } = await client.get<CountedList>(endpoint, {
    params: { ...filters, page: 1, per_page: 1 },
  })

  return data.meta.total
}
