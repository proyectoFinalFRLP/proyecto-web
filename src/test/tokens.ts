/**
 * Tokens de prueba.
 *
 * La firma es un texto cualquiera a propósito: el cliente no la verifica —no
 * tiene la clave— y fabricar una real acá probaría el algoritmo de `jsonwebtoken`
 * en vez del código del repo.
 */

export function base64url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Arma un JWT con el payload crudo, tal como lo emite Rails (snake_case). */
export function tokenWith(payload: object): string {
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(payload)}.signature`
}

interface SessionTokenOptions {
  userId?: number
  companyId?: number
  /** Milisegundos desde ahora hasta el vencimiento. Negativo = ya vencido. */
  expiresInMs?: number
}

export function sessionToken({
  userId = 7,
  companyId = 3,
  expiresInMs = 60 * 60 * 1000,
}: SessionTokenOptions = {}): string {
  return tokenWith({
    user_id: userId,
    company_id: companyId,
    exp: Math.floor((Date.now() + expiresInMs) / 1000),
  })
}
