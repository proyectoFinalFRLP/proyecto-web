/**
 * Lectura del payload de un JWT emitido por el backend.
 *
 * El token se decodifica sin verificar la firma: eso es responsabilidad del
 * backend en cada request. Acá sólo se lee para saber a qué tenant pertenece la
 * sesión y cuándo vence, así que un token adulterado no otorga ningún acceso
 * real — la API lo rechaza igual.
 */

/** Claims que el backend incluye en el token (ver User#jwt_payload en la API). */
export interface JwtPayload {
  userId: number
  companyId: number
  /** Vencimiento en segundos desde epoch. */
  exp?: number
}

interface RawJwtPayload {
  user_id?: number
  company_id?: number
  exp?: number
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  // decodeURIComponent + escape preserva los caracteres no ASCII del payload.
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  )
}

/** Devuelve los claims del token, o `null` si no es un JWT legible. */
export function decodeJwt(token: string): JwtPayload | null {
  const segments = token.split('.')
  if (segments.length !== 3) return null

  try {
    const raw = JSON.parse(decodeBase64Url(segments[1])) as RawJwtPayload
    if (typeof raw.user_id !== 'number' || typeof raw.company_id !== 'number') return null

    return { userId: raw.user_id, companyId: raw.company_id, exp: raw.exp }
  } catch {
    return null
  }
}

/** `true` si el token ya venció según su claim `exp`. Sin `exp`, se asume vigente. */
export function isJwtExpired(payload: JwtPayload, now: number = Date.now()): boolean {
  if (typeof payload.exp !== 'number') return false
  return payload.exp * 1000 <= now
}
