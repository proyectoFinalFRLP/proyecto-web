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
    // El email tipeado se guarda con la sesión: no viaja en el JWT ni lo
    // devuelve el login, y es lo único que la UI puede mostrar del usuario.
    onSuccess: (data, variables) => login(data.token, variables.email),
  })
}
