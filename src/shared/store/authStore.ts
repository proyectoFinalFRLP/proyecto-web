import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { queryClient } from '../api/queryClient'
import { revokeSession } from '../api/session'
import { decodeJwt, isExpired } from '../utils/jwt'

/** La identidad de la sesión, tal como la confirma `GET /me` (TESIS-117). */
export interface SessionUser {
  id: number
  companyId: number
  email: string
  /** Nombre de la empresa. Una app multi-tenant necesita poder decirlo. */
  companyName: string
}

interface AuthState {
  token: string | null
  /**
   * `null` mientras `GET /me` no respondió, incluso con sesión válida: quién es
   * el usuario lo dice el backend, no el token. Lo que gobierna el acceso es
   * `isAuthenticated`, así que una recarga no manda a nadie al login por estar
   * esperando esta respuesta.
   */
  user: SessionUser | null
  isAuthenticated: boolean
  /** Devuelve `false` si el token no sirve, para que quien llame pueda avisar. */
  login: (token: string) => boolean
  /** La identidad que trajo `GET /me`. */
  setUser: (user: SessionUser) => void
  logout: () => void
}

type Session = Pick<AuthState, 'token' | 'user' | 'isAuthenticated'>

const EMPTY_SESSION: Session = { token: null, user: null, isAuthenticated: false }

// Se persiste sólo el token. La identidad ya no se guarda: se vuelve a pedir a
// `GET /me` en cada arranque, así una copia vieja en localStorage no puede
// contradecir lo que la API dice hoy.
interface PersistedAuth {
  token: string | null
}

// Lo que hay en localStorage puede venir de una versión anterior de la app o de
// una edición a mano, así que se valida la forma en lugar de castearla. El tipo
// de retorno estrecha `token` a `string`: sin token no hay nada que rehidratar,
// y así el llamador no tiene que volver a comprobarlo.
function readPersisted(value: unknown): { token: string } | null {
  if (typeof value !== 'object' || value === null) return null

  const { token } = value as Record<string, unknown>
  if (typeof token !== 'string') return null

  return { token }
}

// El token sólo decide si hay sesión y si sigue vigente. Quién es el usuario lo
// contesta `GET /me`, que es el único que conoce el correo confirmado y el
// nombre de la empresa.
function sessionFromToken(token: string): Session {
  const payload = decodeJwt(token)
  if (!payload || isExpired(payload)) return EMPTY_SESSION

  return { token, user: null, isAuthenticated: true }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...EMPTY_SESSION,
      login: (token) => {
        const session = sessionFromToken(token)
        set(session)
        return session.isAuthenticated
      },
      setUser: (user) => set({ user }),
      logout: () => {
        // Se dispara la revocación ANTES de limpiar y sin esperarla: el token
        // que hay que revocar es el que está en el store ahora, y hacer esperar
        // al usuario a que el servidor conteste para sacarlo de la pantalla no
        // aporta nada — la revocación es del lado del servidor y pasa igual.
        const { token } = get()
        if (token) void revokeSession(token)

        set(EMPTY_SESSION)
        // La cache de React Query es por tenant: el JWT lleva `company_id`, así
        // que dejarla viva le mostraría al próximo usuario los datos de la
        // empresa anterior hasta el primer refetch.
        queryClient.clear()
      },
    }),
    {
      name: 'auth-store',
      version: 1,
      partialize: (state): PersistedAuth => ({ token: state.token }),
      // Al volver de localStorage el token puede estar vencido, corrupto o no
      // ser un string. Se rearma la sesión desde el token para no arrancar
      // autenticado con una credencial que el backend va a rechazar.
      merge: (persisted, current) => {
        const saved = readPersisted(persisted)
        if (!saved) return current

        return { ...current, ...sessionFromToken(saved.token) }
      },
    },
  ),
)

/**
 * Token para consumidores fuera de React (el interceptor del cliente HTTP).
 * Leerlo del store y no de localStorage evita que queden dos fuentes de verdad.
 */
export function getAuthToken(): string | null {
  return useAuthStore.getState().token
}

export function clearSession(): void {
  useAuthStore.getState().logout()
}
