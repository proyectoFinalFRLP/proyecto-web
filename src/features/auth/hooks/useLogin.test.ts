import type { ApiRequestError } from 'shared/api'
import { describe, expect, it } from 'vitest'

import { authContent } from '../content'

import { loginErrorMessage } from './useLogin'

function failedWith(status?: number): ApiRequestError {
  const error: ApiRequestError = new Error('Request failed')
  error.status = status
  return error
}

describe('loginErrorMessage', () => {
  it('says nothing while there is no error', () => {
    expect(loginErrorMessage(null)).toBeNull()
  })

  it('reports wrong credentials on a 401', () => {
    expect(loginErrorMessage(failedWith(401))).toBe(authContent.errors.invalidCredentials)
  })

  // El backend frena el login después de 10 intentos en 3 minutos (TESIS-82).
  // El mensaje genérico dice «probá en unos segundos», y el freno dura minutos.
  it('asks to wait a few minutes on a 429', () => {
    expect(loginErrorMessage(failedWith(429))).toBe(authContent.errors.tooManyAttempts)
  })

  it.each([
    ['a server error', 500],
    ['a network failure', undefined],
  ])('does not blame the credentials on %s', (_name, status) => {
    expect(loginErrorMessage(failedWith(status))).toBe(authContent.errors.unexpected)
  })
})
