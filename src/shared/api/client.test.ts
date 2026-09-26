import { AxiosError } from 'axios'
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { sessionToken } from '../../test/tokens'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { TENANT_CONFIG_PATH, TENANT_HEADER } from '../utils/tenant'

import { client } from './client'

// Se sustituye el adapter en vez de mockear axios entero: así el request pasa
// por los interceptores reales y lo que se observa es el config final, que es
// exactamente lo que saldría a la red.
const sent: InternalAxiosRequestConfig[] = []

const captureAdapter: AxiosAdapter = async (config) => {
  sent.push(config)
  return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
}

function headerOf(request: InternalAxiosRequestConfig, name: string) {
  return request.headers.get(name)
}

beforeEach(() => {
  sent.length = 0
  client.defaults.adapter = captureAdapter
})

afterEach(() => {
  useAuthStore.getState().logout()
  client.defaults.adapter = undefined
})

// El host de los tests es `localhost` sin override, así que el slug resuelto es
// el default del §5 del contrato.
const HOST_TENANT = 'norte'

describe('tenant header', () => {
  it('travels in every request, not only in the ones that need it', async () => {
    await client.get('/tenant-config')
    await client.get('/products')
    await client.post('/auth/login', { email: 'a@b.com', password: 'secret' })

    expect(sent).toHaveLength(3)
    sent.forEach((request) => {
      expect(headerOf(request, TENANT_HEADER)).toBe(HOST_TENANT)
    })
  })

  // El backend ignora el header cuando hay JWT: los dos conviven, no se pisan.
  it('is sent alongside the authorization header of an open session', async () => {
    const token = sessionToken()
    useAuthStore.getState().login(token)

    await client.get('/products')

    expect(headerOf(sent[0], 'Authorization')).toBe(`Bearer ${token}`)
    expect(headerOf(sent[0], TENANT_HEADER)).toBe(HOST_TENANT)
  })
})

describe('authorization header', () => {
  // `/tenant-config` describe el portal, no la sesión. Con el JWT adjunto el
  // backend contesta por el tenant del token (§3), así que en local una sesión
  // de Sur devolvía la config de Sur para `?tenant=norte` y el front la
  // guardaba bajo `norte`: la app quedaba mostrando la marca equivocada.
  it('is left out of the public tenant-config request', async () => {
    useAuthStore.getState().login(sessionToken())

    await client.get(TENANT_CONFIG_PATH)

    expect(headerOf(sent[0], 'Authorization')).toBeUndefined()
    expect(headerOf(sent[0], TENANT_HEADER)).toBe(HOST_TENANT)
  })

  it('still travels in every other request of the same session', async () => {
    const token = sessionToken()
    useAuthStore.getState().login(token)

    await client.get('/products')
    await client.get(TENANT_CONFIG_PATH)

    expect(headerOf(sent[0], 'Authorization')).toBe(`Bearer ${token}`)
    expect(headerOf(sent[1], 'Authorization')).toBeUndefined()
  })
})

describe('a 401 answer', () => {
  function unauthorized(config: InternalAxiosRequestConfig) {
    return new AxiosError(
      'Request failed with status code 401',
      AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      {
        data: { error: 'Signature has expired' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      },
    )
  }

  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] })
  })

  it('ends the session that sent the request', async () => {
    useAuthStore.getState().login(sessionToken())
    client.defaults.adapter = (config) => Promise.reject(unauthorized(config))

    await expect(client.get('/products')).rejects.toMatchObject({ status: 401 })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  // QA de TESIS-82: si mientras el request viajaba la sesión cambió de dueño,
  // en esta pestaña o en otra, el 401 es de la sesión vieja y no de la actual.
  it('leaves alone a session that was opened while the request was on its way', async () => {
    useAuthStore.getState().login(sessionToken({ userId: 7 }))
    const nueva = sessionToken({ userId: 8 })
    client.defaults.adapter = (config) => {
      if (config.url === '/products') useAuthStore.getState().login(nueva)
      return Promise.reject(unauthorized(config))
    }

    await expect(client.get('/products')).rejects.toMatchObject({ status: 401 })

    expect(useAuthStore.getState().token).toBe(nueva)
  })

  // Un 401 sin sesión son credenciales mal tipeadas en el login: el formulario
  // ya muestra su error, y avisar "tu sesión expiró" sería mentir.
  it('does not warn about an expired session to someone who had none', async () => {
    client.defaults.adapter = (config) => Promise.reject(unauthorized(config))

    await expect(client.post('/auth/login', {})).rejects.toMatchObject({ status: 401 })

    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })
})
