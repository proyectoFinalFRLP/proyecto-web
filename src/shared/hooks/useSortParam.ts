import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { DataTableSort } from 'shared/components'

const SORT = 'sort'
const DIRECTION = 'direction'

/**
 * El orden de un listado, guardado en la URL (`?sort=total&direction=desc`,
 * TESIS-184): sobrevive a recargar la página, a volver atrás y a compartir el
 * link, igual que el buscador del inventario.
 *
 * Sólo acepta las claves que el listado ordena (`sortable`): una clave
 * inventada en la URL se lee como «sin orden» y la API devuelve el de siempre.
 */
export function useSortParam(
  sortable: readonly string[],
): [DataTableSort | null, (next: DataTableSort) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const key = searchParams.get(SORT)
  const direction = searchParams.get(DIRECTION)

  const sort = useMemo<DataTableSort | null>(() => {
    if (key === null || !sortable.includes(key)) return null
    if (direction !== 'asc' && direction !== 'desc') return null

    return { key, direction }
  }, [key, direction, sortable])

  const setSort = useCallback(
    (next: DataTableSort) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          params.set(SORT, next.key)
          params.set(DIRECTION, next.direction)
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return [sort, setSort]
}
