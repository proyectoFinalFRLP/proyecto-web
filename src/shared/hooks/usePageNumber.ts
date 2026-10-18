import { useCallback, useState } from 'react'

type PageUpdate = number | ((current: number) => number)

/**
 * La página de un listado, que vuelve a 1 sola cuando cambia `resetKey` (el
 * orden, por ejemplo: TESIS-184).
 *
 * Sin un efecto: la página guarda para qué clave se eligió, y si la clave
 * cambió —un clic en un encabezado, o la URL que cambia por atrás y adelante—
 * se lee 1 sin un render intermedio con la página vieja. La página 7 de un
 * orden no es la 7 de otro.
 *
 * El cambio de clave también se guarda, ajustando el estado durante el render
 * (el patrón de React para eso). Si solo se derivara, volver a la clave
 * anterior antes de tocar la paginación traería de vuelta su página vieja.
 */
export function usePageNumber(resetKey: string): [number, (next: PageUpdate) => void] {
  const [state, setState] = useState({ key: resetKey, page: 1 })
  if (state.key !== resetKey) setState({ key: resetKey, page: 1 })
  const page = state.key === resetKey ? state.page : 1

  const setPage = useCallback(
    (next: PageUpdate) =>
      setState((previous) => {
        const current = previous.key === resetKey ? previous.page : 1
        return { key: resetKey, page: typeof next === 'function' ? next(current) : next }
      }),
    [resetKey],
  )

  return [page, setPage]
}

/** La clave de reinicio de un orden: cambia si cambia la columna o la dirección. */
export function sortResetKey(sort: { key: string; direction: string } | null): string {
  return sort === null ? '' : `${sort.key}:${sort.direction}`
}
