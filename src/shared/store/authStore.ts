import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  login: (token: string, email: string) => void
  logout: () => void
}

// Persistimos sólo el token y el email: el resto de la sesión (id, empresa) se
// deriva del token al rehidratar, así no puede quedar desincronizado.
interface PersistedAuth {
  token: string | null
  email: string | null
}

function sessionFromToken(
  token: string,
  email: string,
): Pick<AuthState, 'token' | 'user' | 'isAuthenticated'> {
  const payload = decodeJwt(token)
  if (!payload || isExpired(payload)) {
    return { token: null, user: null, isAuthenticated: false }
  }

  return {
    token,
    user: { id: payload.userId, companyId: payload.companyId, email },
    isAuthenticated: true,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, email) => set(sessionFromToken(token, email)),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-store',
      partialize: (state): PersistedAuth => ({
        token: state.token,
        email: state.user?.email ?? null,
      }),
      // Al volver de localStorage el token puede estar vencido o corrupto. Se
      // rearma la sesión desde el token para no arrancar autenticado con una
      // credencial que el backend va a rechazar en la primera request.
      merge: (persisted, current) => {
        const saved = persisted as PersistedAuth | undefined
        if (!saved?.token) return current

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
