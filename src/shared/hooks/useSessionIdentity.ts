import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { fetchCurrentUser } from '../api/session'
import { useAuthStore } from '../store'

export const SESSION_QUERY_KEY = ['session', 'me'] as const

/**
 * Resuelve quién tiene la sesión abierta y lo deja en el store (TESIS-117).
 *
 * Corre mientras haya token, así que cubre los dos momentos que la card pide:
 * el login y la rehidratación desde `localStorage` al recargar la página. La
 * identidad no se persiste —sólo el token—, de modo que siempre sale de esta
 * lectura y no de una copia vieja del navegador.
 *
 * `staleTime: Infinity`: el correo y la empresa de una sesión no cambian
 * mientras dura. Sin esto, cada pantalla que se monte volvería a pedir `/me`
 * sin que haya nada nuevo que traer.
 *
 * Un token válido de un usuario borrado responde 401. De eso se encarga el
 * interceptor del cliente HTTP, que limpia la sesión: el guard de ruta ve
 * `isAuthenticated` en falso y devuelve al login. No hace falta manejarlo acá,
 * y manejarlo duplicaría esa regla en dos lugares.
 */
export function useSessionIdentity() {
  const token = useAuthStore((state) => state.token)
  const setUser = useAuthStore((state) => state.setUser)

  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchCurrentUser,
    enabled: token !== null,
    staleTime: Infinity,
    // `retry: false` contra el `retry: 1` global. El único fallo esperable acá
    // es el 401 de un token válido de un usuario borrado, y reintentarlo no lo
    // va a arreglar: el segundo intento es inofensivo —el interceptor ya dejó
    // el store vacío— pero es un pedido de más y deja la intención ambigua.
    retry: false,
  })

  // El efecto sincroniza hacia el store en lugar de que el store sea la fuente:
  // la respuesta la gobierna React Query —cache, reintentos, invalidación— y el
  // store queda como el lugar único desde donde la lee el resto de la app.
  const { data } = query

  useEffect(() => {
    if (data) setUser(data)
  }, [data, setUser])

  return query
}
