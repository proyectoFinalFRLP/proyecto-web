import { useMutation } from '@tanstack/react-query'
import { client } from 'shared/api'
import type { ApiRequestError } from 'shared/api'
import { useAuthStore } from 'shared/store'
import { decodeJwt } from 'shared/utils/jwt'

import { authContent } from '../content'
import type { LoginCredentials, LoginResponse } from '../types'

const UNAUTHORIZED = 401

/**
 * Traduce el fallo al idioma de la app y distingue el caso esperado (credenciales
 * incorrectas) de cualquier otro, para no mostrar un error de red como si el
 * usuario hubiera tipeado mal la contraseña.
 */
export function loginErrorMessage(error: ApiRequestError | null): string | null {
  if (!error) return null
  return error.status === UNAUTHORIZED
    ? authContent.errors.invalidCredentials
    : authContent.errors.unexpected
}

export function useLogin() {
  const login = useAuthStore((state) => state.login)

  return useMutation<LoginResponse, ApiRequestError, LoginCredentials>({
    mutationFn: async ({ email, password }) => {
      const { data } = await client.post<LoginResponse>('/auth/login', { email, password })

      // El backend respondió 200, pero si el token no se puede leer la sesión no
      // se establece. Sin este chequeo la mutación resolvía OK y el usuario
      // quedaba en el login sin ningún error: un fallo mudo.
      if (!decodeJwt(data.token)) {
        throw new Error(authContent.errors.unexpected)
      }

      return data
    },
    // Sólo el token: quién es el usuario lo contesta `GET /me`, que dispara
    // `useSessionIdentity` apenas hay sesión. El correo tipeado acá no sirve
    // como identidad — si el registro lo normalizó, no es el que la API tiene.
    onSuccess: (data) => login(data.token),
  })
}
