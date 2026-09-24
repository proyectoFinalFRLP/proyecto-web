import type { SessionUser } from '../store/authStore'

import { LOGOUT_PATH, client } from './client'

export const ME_PATH = '/me'

/** Lo que devuelve `GET /me` (`UserSerializer`, vista `with_company`). */
interface ApiCurrentUser {
  id: number
  email: string
  company_id: number
  company: { id: number; name: string }
}

/**
 * La identidad de la sesión, según el backend (`GET /me`, TESIS-109).
 *
 * Es la única fuente de verdad de quién tiene la sesión abierta. El JWT lleva
 * los ids pero no el correo ni el nombre de la empresa, y el correo tipeado en
 * el login no sirve: si el registro lo normaliza, o se escribió con otras
 * mayúsculas, la pantalla muestra algo distinto de lo que la API tiene.
 *
 * Un token válido de un usuario borrado responde 401, y de eso se encarga el
 * interceptor del cliente: limpia la sesión y la app vuelve al login.
 */
export async function fetchCurrentUser(): Promise<SessionUser> {
  const { data } = await client.get<ApiCurrentUser>(ME_PATH)

  return {
    id: data.id,
    email: data.email,
    companyId: data.company_id,
    companyName: data.company.name,
  }
}

/**
 * Revoca el token en el backend (`DELETE /auth/logout`, TESIS-106).
 *
 * **El token se pasa explícitamente** y no se deja que lo ponga el interceptor:
 * `logout()` limpia el store inmediatamente después de disparar esta llamada, y
 * el interceptor de request corre en una microtarea posterior. Si dependiera de
 * él, leería el store ya vacío y el request saldría sin credencial — el backend
 * no tendría qué revocar y el token seguiría vivo hasta vencer.
 *
 * **Nunca lanza.** Si la revocación falla —red caída, backend abajo, token ya
 * vencido— el usuario tiene que salir de la sesión igual: dejarlo adentro
 * porque no hubo internet es peor que no revocar, y el token ya está en el aire
 * de todas formas.
 */
export async function revokeSession(token: string): Promise<void> {
  try {
    await client.delete(LOGOUT_PATH, { headers: { Authorization: `Bearer ${token}` } })
  } catch {
    // Ignorado a propósito: ver el comentario de arriba.
  }
}
