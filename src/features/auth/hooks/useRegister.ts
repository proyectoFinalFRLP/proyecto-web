import { useMutation } from '@tanstack/react-query'
import { client } from 'shared/api'
import type { ApiRequestError } from 'shared/api'

import { authContent } from '../content'
import type { RegistrationRequest, RegistrationResponse } from '../types'

const UNPROCESSABLE = 422
const TOO_MANY_REQUESTS = 429

/**
 * Traduce el fallo del alta, con el mismo criterio que `loginErrorMessage`.
 *
 * El 422 es el único caso donde se muestra el texto del servidor: es el que
 * explica qué campo está mal («Password is too short…»), y también el que
 * responde un slug desconocido o una empresa dada de baja, con un mensaje
 * deliberadamente vago. Cualquier otro status cae en el genérico: un 500 o una
 * caída de red no son culpa de lo que el usuario tipeó.
 */
export function registerErrorMessage(error: ApiRequestError | null): string | null {
  if (!error) return null
  if (error.status === UNPROCESSABLE) return error.message
  // El mismo freno que el login: 10 intentos en 3 minutos.
  if (error.status === TOO_MANY_REQUESTS) return authContent.errors.tooManyAttempts
  return authContent.errors.registerFailed
}

/**
 * `POST /auth/register` — pedir acceso al espacio de la empresa (TESIS-135).
 *
 * No inicia sesión ni devuelve token: la cuenta nace sin aprobar y no puede
 * loguearse hasta que la habiliten desde el backoffice. Por eso la mutación no
 * toca el store de sesión, a diferencia de `useLogin`.
 *
 * La empresa la resuelve el backend con el header `X-Tenant-Slug`, que el
 * cliente agrega en todos los requests; acá no se manda nada de tenant.
 */
export function useRegister() {
  return useMutation<RegistrationResponse, ApiRequestError, RegistrationRequest>({
    mutationFn: async ({ email, password }) => {
      const { data } = await client.post<RegistrationResponse>('/auth/register', {
        email,
        password,
      })

      return data
    },
  })
}
