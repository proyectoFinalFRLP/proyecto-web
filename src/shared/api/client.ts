import axios from 'axios'

import { clearSession, getAuthToken } from '../store/authStore'
import { notify } from '../store/notificationStore'

import type { ApiRequestError } from './types'

const FORBIDDEN_MESSAGE = 'No tenés permisos para realizar esta acción.'

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
    const message = error.response?.data?.error ?? error.response?.data?.message ?? error.message

    // 401: la credencial ya no sirve (vencida, inválida o de otro tenant). Se
    // limpia la sesión completa y el guard de rutas se encarga del redirect,
    // así el interceptor no necesita conocer el router.
    if (status === 401) {
      clearSession()
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
