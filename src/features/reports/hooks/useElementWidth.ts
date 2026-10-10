import { useCallback, useState, useSyncExternalStore } from 'react'

/**
 * El ancho que el layout le da a un elemento, y que se actualiza cuando cambia
 * (la ventana se achica, la sidebar se abre).
 *
 * `useSyncExternalStore` y no un `useState` que escribe el `ResizeObserver`: el
 * cambio se aplica antes de pintar, así el gráfico no muestra un cuadro con los
 * rótulos de antes encimados. `undefined` mientras el elemento no se montó.
 *
 * Devuelve un callback ref: el elemento puede montarse después del primer
 * render, y es al montarse cuando hay algo que medir.
 */
export function useElementWidth<T extends Element>(): [
  (node: T | null) => void,
  number | undefined,
] {
  const [node, setNode] = useState<T | null>(null)

  const subscribe = useCallback(
    (onChange: () => void) => {
      // Sin `ResizeObserver` (jsdom) queda la medida del render, sin seguirla.
      if (node === null || typeof ResizeObserver === 'undefined') return () => undefined

      const observer = new ResizeObserver(onChange)
      observer.observe(node)
      return () => observer.disconnect()
    },
    [node],
  )

  const width = useSyncExternalStore(subscribe, () => node?.getBoundingClientRect().width)

  return [setNode, width]
}
