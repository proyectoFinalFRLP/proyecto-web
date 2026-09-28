import type { ApiRequestError } from 'shared/api'
import { describe, expect, it } from 'vitest'

import { authContent } from '../content'

import { registerErrorMessage } from './useRegister'

function failedWith(status?: number, message = 'Request failed'): ApiRequestError {
  const error: ApiRequestError = new Error(message)
  error.status = status
  return error
}

describe('registerErrorMessage', () => {
  it('says nothing while there is no error', () => {
    expect(registerErrorMessage(null)).toBeNull()
  })

  // El 422 es el que explica qué campo está mal; mostrarlo genérico obligaría a
  // adivinar entre el email, la contraseña y el tenant.
  it('shows what the server objected to on a 422', () => {
    const message = 'Password is too short (minimum is 6 characters)'

    expect(registerErrorMessage(failedWith(422, message))).toBe(message)
  })

  // El mismo freno que el login: 10 intentos en 3 minutos (TESIS-82).
  it('asks to wait a few minutes on a 429', () => {
    expect(registerErrorMessage(failedWith(429))).toBe(authContent.errors.tooManyAttempts)
  })

  it.each([
    ['a server error', 500],
    ['a network failure', undefined],
  ])('does not blame what was typed on %s', (_name, status) => {
    expect(registerErrorMessage(failedWith(status))).toBe(authContent.errors.registerFailed)
  })

  // El texto del servidor sólo sale en el 422: un 500 con un stack adentro no
  // es algo que el usuario tenga que leer.
  it('does not leak the server message on a 500', () => {
    expect(registerErrorMessage(failedWith(500, 'PG::Error: relation does not exist'))).toBe(
      authContent.errors.registerFailed,
    )
  })
})
