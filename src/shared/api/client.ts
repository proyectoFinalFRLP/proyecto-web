import axios from 'axios'
import { getAuthToken, notify, useAuthStore } from 'shared/store'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// El token se inyecta acá, de forma centralizada: ninguna feature arma el header
// por su cuenta. La fuente de verdad es el store de sesión, no localStorage.
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
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const message = error.response?.data?.error ?? error.response?.data?.message ?? error.message

      // 401: la sesión dejó de ser válida (token vencido, inválido o de otro
      // tenant). Se limpia el contexto; la redirección al login la resuelve el
      // guard de rutas al detectar que ya no hay sesión.
      if (status === 401) {
        useAuthStore.getState().logout()
      }

      // 403: la sesión es válida pero no alcanza para esta acción. No se
      // desloguea a nadie: sólo se informa.
      if (status === 403) {
        notify('Acceso denegado: no tenés permisos para realizar esta acción.', 'error')
      }

      return Promise.reject(new Error(message))
    }
    return Promise.reject(error)
  },
)
