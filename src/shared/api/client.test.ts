import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { sessionToken } from '../../test/tokens'
import { useAuthStore } from '../store/authStore'
import { TENANT_HEADER } from '../utils/tenant'

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
    useAuthStore.getState().login(token, 'a@b.com')

    await client.get('/products')

    expect(headerOf(sent[0], 'Authorization')).toBe(`Bearer ${token}`)
    expect(headerOf(sent[0], TENANT_HEADER)).toBe(HOST_TENANT)
  })
})
