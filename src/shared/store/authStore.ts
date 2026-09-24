import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { queryClient } from '../api/queryClient'
import { revokeSession } from '../api/session'
import { decodeJwt, isExpired } from '../utils/jwt'

import { useOrderDraftStore } from './orderDraftStore'

/** Clave de la sesión en localStorage. La sincronización entre pestañas escucha esta. */
const STORAGE_KEY = 'auth-store'

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

// Lo que pertenece al usuario de la sesión, aparte de la sesión misma. Se vacía
// cada vez que la sesión termina o cambia de dueño, porque dejarlo vivo le
// mostraría al próximo usuario lo del anterior:
//
// - La cache de React Query es por tenant: el JWT lleva `company_id`, y la
//   empresa del próximo usuario puede ser otra.
// - El borrador de la orden manual vive en sessionStorage y sobrevivía al
//   logout: quien entraba después en la misma pestaña veía en el alta el
//   cliente, el documento y las líneas del anterior (QA de TESIS-82).
function clearUserData(): void {
  queryClient.clear()
  useOrderDraftStore.getState().clearDraft()
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
        clearUserData()
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state): PersistedAuth => ({ token: state.token }),
      // Al volver de localStorage el token puede estar vencido, corrupto o no
      // ser un string. Se rearma la sesión desde el token para no arrancar
      // autenticado con una credencial que el backend va a rechazar.
      //
      // Sin token guardado no hay sesión, aunque esta pestaña tuviera una: si
      // se está rehidratando por un cambio de otra pestaña (ver
      // `followSessionAcrossTabs`), es que la otra la cerró.
      merge: (persisted, current) => {
        const saved = readPersisted(persisted)
        if (!saved) return { ...current, ...EMPTY_SESSION }

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

/**
 * Mantiene a las pestañas abiertas de acuerdo sobre quién tiene la sesión.
 * Devuelve la función que deja de seguirlas.
 *
 * Las pestañas comparten localStorage pero no el store: cada una tiene su copia
 * en memoria. Sin esto, cerrar sesión en una dejaba a la otra mostrando datos
 * con un token revocado. Y cuando esa otra recibía el 401, escribía la sesión
 * vacía en localStorage y le borraba la sesión guardada a quien se hubiera
 * logueado mientras tanto (QA de TESIS-82).
 *
 * El evento `storage` llega sólo a las otras pestañas, nunca a la que escribió.
 * Se relee la sesión guardada y, si cambió de token, se vacía lo del usuario
 * anterior.
 */
export function followSessionAcrossTabs(): () => void {
  const onStorage = (event: StorageEvent) => {
    // `key === null` es un `localStorage.clear()` hecho en otra pestaña.
    if (event.key !== null && event.key !== STORAGE_KEY) return

    const before = useAuthStore.getState().token
    // Con localStorage la rehidratación es sincrónica: al volver de acá el
    // store ya tiene la sesión que dejó la otra pestaña.
    void useAuthStore.persist.rehydrate()
    if (useAuthStore.getState().token !== before) clearUserData()
  }

  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}
