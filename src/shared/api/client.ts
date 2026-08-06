import axios from 'axios'

import { clearSession, getAuthToken } from '../store/authStore'
import { notify } from '../store/notificationStore'

import type { ApiRequestError } from './types'

const FORBIDDEN_MESSAGE = 'No tenés permisos para realizar esta acción.'
const SESSION_EXPIRED_MESSAGE = 'Tu sesión expiró. Ingresá de nuevo.'
const NETWORK_MESSAGE = 'No pudimos conectarnos con el servidor.'

// La API puede devolver un error estructurado (ej. un 422 de Rails con
// `errors: { campo: [...] }`). Sin verificar el tipo, ese objeto termina
// renderizado como "[object Object]" en la pantalla del usuario.
function firstMessage(...candidates: unknown[]): string | undefined {
  return candidates.find(
    (candidate): candidate is string => typeof candidate === 'string' && candidate.trim() !== '',
  )
}

function toRequestError(message: string, status?: number): ApiRequestError {
  const error: ApiRequestError = new Error(message)
  error.status = status
  return error
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor único y centralizado: ningún componente arma el header a mano.
// El token se lee del store y no de localStorage para no tener dos fuentes de
// verdad sobre la sesión.
client.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const status = error.response?.status
    const data: unknown = error.response?.data
    const payload =
      typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
    const message = firstMessage(payload.error, payload.message, error.message) ?? NETWORK_MESSAGE

    // 401: la credencial ya no sirve (vencida, inválida o de otro tenant). Se
    // limpia la sesión y el guard de rutas se encarga del redirect, así el
    // interceptor no necesita conocer el router.
    //
    // Sólo se actúa si **había** sesión: un 401 del propio login son
    // credenciales mal tipeadas, y el formulario ya muestra su error. Avisarle
    // "tu sesión expiró" a quien nunca la tuvo sería mentirle.
    if (status === 401 && getAuthToken()) {
      clearSession()
      notify(SESSION_EXPIRED_MESSAGE, 'warning')
    }

    // 403: la sesión es válida pero la acción no está permitida. No se
    // desloguea: sacar al usuario del sistema por pedir algo que no le
    // corresponde sería peor que informarle.
    if (status === 403) {
      notify(FORBIDDEN_MESSAGE, 'error')
    }

    return Promise.reject(toRequestError(message, status))
  },
)
