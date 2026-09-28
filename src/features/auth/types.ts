export interface LoginCredentials {
  email: string
  password: string
}

/** Respuesta de `POST /auth/login`: el backend sólo devuelve el token. */
export interface LoginResponse {
  token: string
}

/**
 * Lo que se manda a `POST /auth/register`. La empresa no viaja en el body: la
 * resuelve el backend con el header `X-Tenant-Slug`, y un `company_id` acá se
 * ignora (TESIS-120).
 */
export interface RegistrationRequest {
  email: string
  password: string
}

/**
 * Respuesta de `POST /auth/register`: un 202 con el estado de la solicitud.
 *
 * Es la misma se haya creado la cuenta o el email ya tuviera una. La API lo
 * hace a propósito —si cambiara, el registro diría qué emails existen—, así que
 * la pantalla tampoco intenta distinguir los dos casos.
 */
export interface RegistrationResponse {
  status: string
}
