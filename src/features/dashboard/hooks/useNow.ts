import { useEffect, useState } from 'react'

// Reloj de UI: re-renderiza cada `intervalMs` para que el tiempo relativo del
// nodo ("hace 2 minutos") avance y el LED cruce el umbral de frescura solo,
// sin depender de un refetch. Es lo que pide el criterio "el LED reacciona si
// la fecha de actualización es demasiado antigua": la fecha no cambia, cambia
// el ahora contra el que la comparamos.
//
// No contradice la regla de "nunca useEffect + useState": esa aplica al fetch
// de datos (que va por React Query). Acá no se busca nada al servidor, es un
// tick local.
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}
