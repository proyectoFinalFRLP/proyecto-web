import { decodeJwt, isJwtExpired } from 'shared/utils/jwt'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'auth-store'

interface AuthSession {
  token: string | null
  userId: number | null
  companyId: number | null
  /**
   * El backend no devuelve datos del usuario en el login (sólo el token), y el
   * JWT no incluye el email. Lo completa la pantalla de login (TESIS-51) con el
   * dato que ya tiene del formulario.
   */
  email: string | null
}

interface AuthState extends AuthSession {
  isAuthenticated: boolean
  /** Guarda la sesión a partir del token emitido por el backend. */
  login: (token: string, email?: string) => boolean
  /** Limpia token y contexto. Se usa en el logout manual y ante un 401. */
  logout: () => void
}

const EMPTY_SESSION: AuthSession = { token: null, userId: null, companyId: null, email: null }

function sessionFromToken(token: string, email?: string): AuthSession | null {
  const payload = decodeJwt(token)
  if (!payload || isJwtExpired(payload)) return null

  return { token, userId: payload.userId, companyId: payload.companyId, email: email ?? null }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...EMPTY_SESSION,
      isAuthenticated: false,

      login: (token, email) => {
        const session = sessionFromToken(token, email)
        if (!session) {
          set({ ...EMPTY_SESSION, isAuthenticated: false })
          return false
        }

        set({ ...session, isAuthenticated: true })
        return true
      },

      logout: () => set({ ...EMPTY_SESSION, isAuthenticated: false }),
    }),
    {
      name: STORAGE_KEY,
      // Sólo se persiste el token: el resto del contexto se deriva de él al
      // rehidratar, así no puede quedar desincronizado.
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // Un token vencido en localStorage no debe revivir la sesión: se limpia
        // en el arranque para no mostrar la app y recibir un 401 al primer fetch.
        const session = state.token ? sessionFromToken(state.token) : null
        if (session) {
          state.token = session.token
          state.userId = session.userId
          state.companyId = session.companyId
          state.isAuthenticated = true
        } else {
          state.token = null
          state.userId = null
          state.companyId = null
          state.email = null
          state.isAuthenticated = false
        }
      },
    },
  ),
)

/** Acceso al token fuera de React (interceptores de Axios). */
export function getAuthToken(): string | null {
  return useAuthStore.getState().token
}
