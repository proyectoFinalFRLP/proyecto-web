import { LOGOUT_PATH, client } from './client'

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
