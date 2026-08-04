export interface LoginCredentials {
  email: string
  password: string
}

/** Respuesta de `POST /auth/login`: el backend sólo devuelve el token. */
export interface LoginResponse {
  token: string
}
