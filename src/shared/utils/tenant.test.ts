import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_TENANT_SLUG, resolveTenantSlug } from './tenant'

function slugAt(hostname: string, search = '') {
  return resolveTenantSlug({ hostname, search })
}

beforeEach(() => {
  // Sin esto el `.env` de quien corre los tests decidiría el resultado de la
  // mitad de los casos.
  vi.stubEnv('VITE_TENANT', '')
})

describe('resolveTenantSlug', () => {
  it('takes the slug from the subdomain the app is served from', () => {
    expect(slugAt('norte.precision-oms.com')).toBe('norte')
    expect(slugAt('sur.precision-oms.com')).toBe('sur')
  })

  it('reads the subdomain case-insensitively', () => {
    expect(slugAt('NORTE.Precision-OMS.com')).toBe('norte')
  })

  // El camino real de subdominio, probado en desarrollo: `*.localhost` resuelve
  // en la mayoría de los browsers y es lo más cerca que se puede estar de la
  // demo sin desplegar.
  it('accepts a subdomain over localhost', () => {
    expect(slugAt('sur.localhost')).toBe('sur')
  })

  it('prefers the query param over the environment variable', () => {
    vi.stubEnv('VITE_TENANT', 'importadora')

    expect(slugAt('localhost', '?tenant=sur')).toBe('sur')
  })

  it('falls back to VITE_TENANT when the url says nothing', () => {
    vi.stubEnv('VITE_TENANT', 'sur')

    expect(slugAt('localhost')).toBe('sur')
    expect(slugAt('127.0.0.1')).toBe('sur')
  })

  it('falls back to the default tenant when there is no override at all', () => {
    expect(slugAt('localhost')).toBe(DEFAULT_TENANT_SLUG)
  })

  // El override es una comodidad de desarrollo, no una forma de pedir la
  // identidad de otra empresa desde la URL de producción.
  it('ignores the development overrides when the host already names a tenant', () => {
    vi.stubEnv('VITE_TENANT', 'importadora')

    expect(slugAt('norte.precision-oms.com', '?tenant=sur')).toBe('norte')
  })

  it('reports no tenant for a host that does not name one', () => {
    expect(slugAt('precision-oms.com')).toBeNull()
    expect(slugAt('www.precision-oms.com')).toBeNull()
    expect(slugAt('192.168.0.10')).toBeNull()
  })

  // Mandar basura en el header sólo produce un 404 más confuso que el que ya
  // devuelve un slug inexistente.
  it('discards an override that is not a valid slug', () => {
    expect(slugAt('localhost', '?tenant=Sur S.R.L.')).toBe(DEFAULT_TENANT_SLUG)
    expect(slugAt('localhost', '?tenant=')).toBe(DEFAULT_TENANT_SLUG)
  })
})
