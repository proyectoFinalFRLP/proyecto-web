import { describe, expect, it } from 'vitest'

import { base64url, tokenWith } from '../../test/tokens'

import { decodeJwt, isExpired } from './jwt'

const VALID_PAYLOAD = { user_id: 7, company_id: 3, exp: 1_800_000_000 }

describe('decodeJwt', () => {
  it('reads the three claims the UI needs', () => {
    expect(decodeJwt(tokenWith(VALID_PAYLOAD))).toEqual({
      userId: 7,
      companyId: 3,
      exp: 1_800_000_000,
    })
  })

  // El token puede llegar de localStorage, donde lo escribió una versión
  // anterior de la app o una edición a mano. Nada de esto puede tumbar el
  // arranque: es ausencia de sesión, no una excepción.
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 42],
    ['an object', { token: 'x' }],
    ['an empty string', ''],
  ])('treats %s as no session', (_name, value) => {
    expect(decodeJwt(value)).toBeNull()
  })

  it('rejects a token that does not have three segments', () => {
    expect(decodeJwt('header.payload')).toBeNull()
  })

  it('rejects a payload that is not valid JSON', () => {
    expect(decodeJwt(`${base64url({ alg: 'HS256' })}.bm90LWpzb24.signature`)).toBeNull()
  })

  it('accepts ids serialized as numeric strings', () => {
    const token = tokenWith({ user_id: '7', company_id: '3', exp: '1800000000' })

    expect(decodeJwt(token)).toEqual({ userId: 7, companyId: 3, exp: 1_800_000_000 })
  })

  it.each(['user_id', 'company_id', 'exp'])('rejects a payload without %s', (claim) => {
    const payload: Record<string, unknown> = { ...VALID_PAYLOAD }
    delete payload[claim]

    expect(decodeJwt(tokenWith(payload))).toBeNull()
  })

  it('rejects a claim that is not a finite number', () => {
    expect(decodeJwt(tokenWith({ ...VALID_PAYLOAD, exp: 'soon' }))).toBeNull()
  })

  // El backend serializa `company_id` como número. Si algún día lo mandara como
  // string, descartar el token dejaría el login roto sin un mensaje: por eso la
  // coerción de arriba existe, y por eso este caso queda fijado.
  it('does not confuse a boolean with a number', () => {
    expect(decodeJwt(tokenWith({ ...VALID_PAYLOAD, user_id: true }))).toBeNull()
  })
})

describe('isExpired', () => {
  const payload = { userId: 7, companyId: 3, exp: 1_800_000_000 }

  it('is false while the expiry is in the future', () => {
    expect(isExpired(payload, 1_799_999_000_000)).toBe(false)
  })

  it('is true once the expiry has passed', () => {
    expect(isExpired(payload, 1_800_000_001_000)).toBe(true)
  })

  // El borde va del lado de cerrar la sesión: un token que vence justo ahora ya
  // no sirve para el próximo request.
  it('is true exactly at the expiry instant', () => {
    expect(isExpired(payload, 1_800_000_000_000)).toBe(true)
  })
})
