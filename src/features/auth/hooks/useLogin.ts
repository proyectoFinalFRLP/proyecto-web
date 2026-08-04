import { useMutation } from '@tanstack/react-query'
import { client } from 'shared/api'
import type { ApiRequestError } from 'shared/api'
import { useAuthStore } from 'shared/store'

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
      return data
    },
    // El email tipeado se guarda con la sesión: no viaja en el JWT ni lo
    // devuelve el login, y es lo único que la UI puede mostrar del usuario.
    onSuccess: (data, variables) => login(data.token, variables.email),
  })
}
