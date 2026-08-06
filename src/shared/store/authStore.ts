import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { queryClient } from '../api/queryClient'
import { decodeJwt, isExpired } from '../utils/jwt'

export interface SessionUser {
  id: number
  companyId: number
  /**
   * El email tipeado en el login. El backend no lo devuelve ni viaja en el JWT,
   * y es lo único que la UI puede mostrar del usuario hasta que exista `GET /me`.
   */
  email: string
}

interface AuthState {
  token: string | null
  user: SessionUser | null
  isAuthenticated: boolean
  /** Devuelve `false` si el token no sirve, para que quien llame pueda avisar. */
  login: (token: string, email: string) => boolean
  logout: () => void
}

type Session = Pick<AuthState, 'token' | 'user' | 'isAuthenticated'>

const EMPTY_SESSION: Session = { token: null, user: null, isAuthenticated: false }

// Persistimos sólo el token y el email: el resto de la sesión (id, empresa) se
// deriva del token al rehidratar, así no puede quedar desincronizado.
interface PersistedAuth {
  token: string | null
  email: string | null
}

// Lo que hay en localStorage puede venir de una versión anterior de la app o de
// una edición a mano, así que se valida la forma en lugar de castearla. El tipo
// de retorno estrecha `token` a `string`: sin token no hay nada que rehidratar,
// y así el llamador no tiene que volver a comprobarlo.
function readPersisted(value: unknown): { token: string; email: string | null } | null {
  if (typeof value !== 'object' || value === null) return null

  const { token, email } = value as Record<string, unknown>
  if (typeof token !== 'string') return null

  return { token, email: typeof email === 'string' ? email : null }
}

function sessionFromToken(token: string, email: string): Session {
  const payload = decodeJwt(token)
  if (!payload || isExpired(payload)) return EMPTY_SESSION

  return {
    token,
    user: { id: payload.userId, companyId: payload.companyId, email },
    isAuthenticated: true,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...EMPTY_SESSION,
      login: (token, email) => {
        const session = sessionFromToken(token, email)
        set(session)
        return session.isAuthenticated
      },
      logout: () => {
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
      partialize: (state): PersistedAuth => ({
        token: state.token,
        email: state.user?.email ?? null,
      }),
      // Al volver de localStorage el token puede estar vencido, corrupto o no
      // ser un string. Se rearma la sesión desde el token para no arrancar
      // autenticado con una credencial que el backend va a rechazar.
      merge: (persisted, current) => {
        const saved = readPersisted(persisted)
        if (!saved) return current

        return { ...current, ...sessionFromToken(saved.token, saved.email ?? '') }
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
