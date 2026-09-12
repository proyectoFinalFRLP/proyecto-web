import type { AxiosAdapter } from 'axios'
import { AxiosHeaders } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Se mockean los dos módulos que el interceptor toca ante un 401. El de auth
// devuelve un token para que la rama quede activa: así, si el ejemplo del
// logout pasa, es por la excepción de LOGOUT_PATH y no porque no había sesión.
vi.mock('../store/notificationStore', () => ({ notify: vi.fn() }))
vi.mock('../store/authStore', () => ({
  getAuthToken: () => 'un-token',
  clearSession: vi.fn(),
}))

import { clearSession } from '../store/authStore'
import { notify } from '../store/notificationStore'

import { LOGOUT_PATH, client } from './client'
import { ME_PATH, fetchCurrentUser, revokeSession } from './session'

const realAdapter = client.defaults.adapter

afterEach(() => {
  client.defaults.adapter = realAdapter
  vi.clearAllMocks()
})

/** Reemplaza el transporte de axios sin tocar los interceptores, que son lo que se prueba. */
function stubAdapter(adapter: AxiosAdapter) {
  client.defaults.adapter = adapter
}

function ok(): AxiosAdapter {
  return (config) =>
    Promise.resolve({
      data: {},
      status: 204,
      statusText: 'No Content',
      headers: new AxiosHeaders(),
      config,
    })
}

function failing(status: number): AxiosAdapter {
  return (config) =>
    Promise.reject(
      Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        config,
        response: {
          data: {},
          status,
          statusText: 'Error',
          headers: new AxiosHeaders(),
          config,
        },
      }),
    )
}

/** Responde 200 con el cuerpo dado, para los casos de `GET /me`. */
function serving(body: unknown): AxiosAdapter {
  return (config) =>
    Promise.resolve({
      data: body,
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config,
    })
}

// ------------------------------------------------------------------ TESIS-117
describe('fetchCurrentUser', () => {
  const ME = {
    id: 7,
    email: 'confirmado@acme.com',
    company_id: 3,
    company: { id: 3, name: 'Acme' },
  }

  it('asks the backend who owns the session', async () => {
    const adapter = vi.fn(serving(ME))
    stubAdapter(adapter)

    await fetchCurrentUser()

    expect(adapter.mock.calls[0][0].url).toBe(ME_PATH)
  })

  it('returns the email the API confirms', async () => {
    stubAdapter(serving(ME))

    await expect(fetchCurrentUser()).resolves.toMatchObject({ email: 'confirmado@acme.com' })
  })

  // El dato que antes no existía en ningún lado: el JWT lleva el id de la
  // empresa pero no su nombre, y una app multi-tenant necesita nombrarla.
  it('brings the name of the company, not just its id', async () => {
    stubAdapter(serving(ME))

    await expect(fetchCurrentUser()).resolves.toMatchObject({ companyId: 3, companyName: 'Acme' })
  })

  /**
   * Un token válido de un usuario borrado. El backend responde 401 y de limpiar
   * la sesión se encarga el interceptor, no esta función: la regla vive en un
   * solo lugar y acá se verifica que efectivamente corra por este camino.
   */
  it('lets the interceptor clear the session when the user no longer exists', async () => {
    stubAdapter(failing(401))

    await expect(fetchCurrentUser()).rejects.toThrow()

    expect(clearSession).toHaveBeenCalled()
  })
})

describe('revokeSession', () => {
  it('calls the logout endpoint', async () => {
    const adapter = vi.fn(ok())
    stubAdapter(adapter)

    await revokeSession('un-token')

    expect(adapter.mock.calls[0][0].url).toBe(LOGOUT_PATH)
  })

  /**
   * El token va explícito y no lo pone el interceptor: `logout()` limpia el
   * store inmediatamente después de disparar esta llamada, así que si dependiera
   * del interceptor el request saldría sin credencial y el backend no tendría
   * qué revocar.
   */
  it('sends the token it receives', async () => {
    const adapter = vi.fn(ok())
    stubAdapter(adapter)

    await revokeSession('otro-token')

    expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer otro-token')
  })

  // Si la revocación falla, el usuario tiene que salir igual: dejarlo dentro
  // porque no hubo red sería peor que no revocar.
  it('does not throw when the server answers with an error', async () => {
    stubAdapter(failing(500))

    await expect(revokeSession('un-token')).resolves.toBeUndefined()
  })

  it('does not throw when the endpoint does not exist', async () => {
    stubAdapter(failing(404))

    await expect(revokeSession('un-token')).resolves.toBeUndefined()
  })
})

/**
 * Un token ya vencido o ya revocado hace que el propio logout devuelva 401.
 * Avisarle "tu sesión expiró" a quien la está cerrando a propósito sería ruido,
 * y el aviso aparecería después de que la pantalla ya volvió al login.
 */
describe('the 401 of the logout itself', () => {
  it('does not warn that the session expired', async () => {
    stubAdapter(failing(401))

    await revokeSession('un-token')

    expect(notify).not.toHaveBeenCalled()
  })

  it('does not clear the session a second time', async () => {
    stubAdapter(failing(401))

    await revokeSession('un-token')

    expect(clearSession).not.toHaveBeenCalled()
  })

  // Contraprueba: el mismo 401 en cualquier otra ruta sí tiene que avisar. Sin
  // esto, los dos ejemplos de arriba pasarían igual si el interceptor estuviera
  // roto y no avisara nunca.
  it('still warns on a 401 of any other route', async () => {
    stubAdapter(failing(401))

    await expect(client.get('/products')).rejects.toThrow()

    expect(notify).toHaveBeenCalled()
    expect(clearSession).toHaveBeenCalled()
  })
})
