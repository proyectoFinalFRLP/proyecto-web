import { useEffect, useState } from 'react'

/**
 * Devuelve el valor recién cuando dejó de cambiar durante `delay` ms.
 *
 * El buscador del listado dispara una consulta por cada pulsación si se lo
 * cablea directo: escribir "andreani" son ocho requests de los que siete se
 * descartan. Acá vive en la feature y no en `shared/hooks` por la regla de dos
 * —todavía hay un solo consumidor—; cuando aparezca el segundo, sube.
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
