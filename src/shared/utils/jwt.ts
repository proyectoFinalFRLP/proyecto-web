/**
 * Lectura del payload de un JWT **sin verificar la firma**.
 *
 * El cliente no puede validar el token: no tiene la clave. Quien decide si un
 * token es legítimo es el backend, en cada request. Acá el payload se lee sólo
 * para dos cosas de UI: saber a qué empresa pertenece la sesión y descartar de
 * entrada un token ya vencido, en vez de esperar el primer 401.
 */

export interface JwtPayload {
  userId: number
  companyId: number
  /** Vencimiento en segundos desde epoch, como lo emite el backend. */
  exp: number
}

interface RawJwtPayload {
  user_id?: unknown
  company_id?: unknown
  exp?: unknown
}

// base64url → base64 + padding, que es lo que entiende atob.
function decodeSegment(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  return atob(padded)
}

export function decodeJwt(token: string): JwtPayload | null {
  const segments = token.split('.')
  if (segments.length !== 3) return null

  try {
    const raw = JSON.parse(decodeSegment(segments[1])) as RawJwtPayload
    const { user_id: userId, company_id: companyId, exp } = raw

    if (typeof userId !== 'number' || typeof companyId !== 'number' || typeof exp !== 'number') {
      return null
    }

    return { userId, companyId, exp }
  } catch {
    // Token con formato inválido: se trata como ausencia de sesión.
    return null
  }
}

export function isExpired(payload: JwtPayload, now: number = Date.now()): boolean {
  return payload.exp * 1000 <= now
}
