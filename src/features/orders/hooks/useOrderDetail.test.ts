import type { ApiRequestError } from 'shared/api/types'
import { describe, expect, it } from 'vitest'

import { shouldRetryOrder } from './useOrderDetail'

function failure(status?: number): ApiRequestError {
  const error: ApiRequestError = new Error('failed')
  error.status = status
  return error
}

describe('shouldRetryOrder', () => {
  // Una orden que no existe no va a aparecer: reintentar sólo demora el aviso.
  it('does not retry an order that was not found', () => {
    expect(shouldRetryOrder(0, failure(404))).toBe(false)
  })

  it('retries any other failure once, like the rest of the app', () => {
    expect(shouldRetryOrder(0, failure(500))).toBe(true)
    expect(shouldRetryOrder(1, failure(500))).toBe(false)
  })

  it('retries a network failure, which has no status', () => {
    expect(shouldRetryOrder(0, failure())).toBe(true)
  })
})
