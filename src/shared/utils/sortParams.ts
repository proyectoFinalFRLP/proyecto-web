import type { DataTableSort } from 'shared/components'

/**
 * El orden de un listado como lo lee la API (`?sort=&direction=`, TESIS-184).
 * Sin orden no viaja nada y la API usa el de siempre: mandar claves vacías
 * ensuciaría la URL y la clave de caché, el mismo criterio que con `search`.
 */
export function sortParams(sort: DataTableSort | null | undefined): {
  sort?: string
  direction?: string
} {
  return sort ? { sort: sort.key, direction: sort.direction } : {}
}
