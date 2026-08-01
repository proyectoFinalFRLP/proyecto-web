import { useMutation } from '@tanstack/react-query'
import { client } from 'shared/api/client'
import { useAuthStore } from 'shared/store'

import type { LoginCredentials, LoginResponse } from '../types'

/**
 * Autenticación contra la API. Al recibir el token se guarda la sesión junto con
 * el email tipeado: ese dato no viaja en el JWT y es lo único que el frontend
 * puede mostrar del usuario hasta que exista un endpoint que lo devuelva.
 */
export function useLogin() {
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const { data } = await client.post<LoginResponse>('/auth/login', { email, password })
      return data
    },
    onSuccess: (data, variables) => {
      login(data.token, variables.email)
    },
  })
}
