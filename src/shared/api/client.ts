import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

import { clearSession, getAuthToken } from '../store/authStore'
import { notify } from '../store/notificationStore'
import { currentTenantSlug, TENANT_CONFIG_PATH, TENANT_HEADER } from '../utils/tenant'

import type { ApiRequestError } from './types'

/**
 * Ruta de cierre de sesión.
 *
 * Vive acá, y no suelta en cada archivo, porque dos lugares tienen que estar de
 * acuerdo sobre cuál es: el que la llama y el interceptor que decide no tratar
 * su 401 como una sesión vencida.
 */
export const LOGOUT_PATH = '/auth/logout'

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

// Si el request salió con el token de la sesión que está abierta ahora.
//
// Un 401 habla de la credencial con la que salió el request, no de la sesión
// de ahora. Si en el medio la sesión cambió (se cerró y entró otra persona, en
// esta pestaña o en otra), ese 401 no dice nada de la sesión actual, y tratarlo
// como vencida la cerraba (QA de TESIS-82). Sin token, además, no había sesión
// que cerrar: un 401 del propio login son credenciales mal tipeadas, y el
// formulario ya muestra su error.
function sentWithCurrentSession(config: InternalAxiosRequestConfig | undefined): boolean {
  const token = getAuthToken()
  return token !== null && config?.headers.get('Authorization') === `Bearer ${token}`
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
  // Una credencial puesta a mano por quien llama gana sobre la del store.
  // `revokeSession` manda el token a revocar de forma explícita, porque para
  // cuando este interceptor corre el store ya se vació: sin esta guarda, el
  // request saldría sin Authorization y el backend no tendría qué revocar.
  //
  // Es una bandera y no un `return config` anticipado: cortar acá salteaba
  // también el header de tenant, que desde TESIS-121 viaja en TODOS los
  // requests. El único que llega con credencial propia es el logout.
  const hasExplicitToken = Boolean(config.headers.Authorization)

  // `/tenant-config` es público y describe **el portal**, no la sesión. Con un
  // JWT adjunto el backend contesta por el tenant del token (§3 del contrato),
  // que en local puede no ser el del slug: con sesión de Sur y `?tenant=norte`
  // volvía la config de Sur, y el front la guardaba bajo `norte`. La pregunta
  // sale sin firmar para que la respuesta sea siempre sobre el slug que se pide.
  const token = getAuthToken()
  if (!hasExplicitToken && token && config.url !== TENANT_CONFIG_PATH) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // El slug viaja en **todos** los requests, sin condicionar por endpoint (§1
  // del contrato). Es inofensivo: donde hay JWT el backend lo ignora y usa el
  // `company_id` del token. Condicionar por endpoint sería duplicar acá la
  // lista de rutas públicas del backend para no ganar nada.
  const tenantSlug = currentTenantSlug()
  if (tenantSlug) {
    config.headers[TENANT_HEADER] = tenantSlug
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
    // Sólo se actúa si el request salió con la sesión que está abierta ahora
    // (ver `sentWithCurrentSession`). Avisarle "tu sesión expiró" a quien nunca
    // la tuvo, o a quien acaba de abrir otra, sería mentirle.
    // Un 401 del propio logout se ignora: el token ya no sirve, que es
    // exactamente lo que se estaba pidiendo. Avisar "tu sesión expiró" a quien
    // acaba de cerrarla a propósito sería ruido, y `logout()` ya limpia el
    // store por su cuenta.
    const isLogout = error.config?.url === LOGOUT_PATH

    if (status === 401 && !isLogout && sentWithCurrentSession(error.config)) {
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
