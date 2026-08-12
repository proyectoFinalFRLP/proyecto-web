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

// Los ids se aceptan como número o como string numérico: hoy Rails los serializa
// como números, pero si eso cambiara, descartar el token dejaría el login roto
// en silencio. Coercionar es más barato que depender de la forma exacta.
function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/**
 * `token` se recibe como `unknown` a propósito: uno de sus orígenes es
 * `localStorage`, donde el contenido lo puede haber escrito una versión anterior
 * de la app o una edición manual. Si no es un string, es ausencia de sesión y no
 * una excepción que tumbe el arranque.
 */
export function decodeJwt(token: unknown): JwtPayload | null {
  if (typeof token !== 'string') return null

  const segments = token.split('.')
  if (segments.length !== 3) return null

  try {
    const raw = JSON.parse(decodeSegment(segments[1])) as RawJwtPayload
    const userId = toFiniteNumber(raw.user_id)
    const companyId = toFiniteNumber(raw.company_id)
    const exp = toFiniteNumber(raw.exp)

    if (userId === null || companyId === null || exp === null) return null

    return { userId, companyId, exp }
  } catch {
    // Token con formato inválido: se trata como ausencia de sesión.
    return null
  }
}

export function isExpired(payload: JwtPayload, now: number = Date.now()): boolean {
  return payload.exp * 1000 <= now
}
