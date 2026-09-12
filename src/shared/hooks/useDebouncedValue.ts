import { useEffect, useState } from 'react'

/**
 * Devuelve el valor recién cuando dejó de cambiar durante `delay` ms.
 *
 * Los buscadores de los listados disparan una consulta por cada pulsación si se
 * los cablea directo: escribir "servomotor" son diez requests de los que nueve
 * se descartan.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)

    // Cada tecla cancela el temporizador anterior: sin esto no se retrasa el
    // valor, se emiten todos con `delay` de atraso.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
