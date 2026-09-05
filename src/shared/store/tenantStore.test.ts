import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TenantConfig } from '../api/tenant'

// El store resuelve el slug y se rehidrata en el momento en que se crea, así que
// cada caso siembra el storage y recién después importa el módulo.
async function loadStore() {
  vi.resetModules()
  return import('./tenantStore')
}

function persist(state: unknown, version = 1) {
  localStorage.setItem('tenant-store', JSON.stringify({ state, version }))
}

const norteConfig: TenantConfig = {
  slug: 'norte',
  name: 'Distribuidora Norte S.A.',
  branding: {
    display_name: 'Distribuidora Norte',
    primary_color: '#2E7D32',
    accent_color: '#66BB6A',
    logo_url: null,
    tagline: 'Logística del norte',
  },
  features: { integrations: true },
}

beforeEach(() => {
  localStorage.clear()
  vi.stubEnv('VITE_TENANT', '')
})

describe('tenant store', () => {
  it('starts with the slug of the host and without config', async () => {
    const { useTenantStore } = await loadStore()

    // El host de los tests es `localhost` sin override: default del §5.
    expect(useTenantStore.getState().slug).toBe('norte')
    expect(useTenantStore.getState().config).toBeNull()
  })

  // Es lo que evita el splash en cada reload.
  it('restores a cached config of the same tenant', async () => {
    persist({ slug: 'norte', config: norteConfig })

    const { useTenantStore } = await loadStore()

    expect(useTenantStore.getState().config).toEqual(norteConfig)
  })

  // Sin este chequeo, abrir `?tenant=sur` en una pestaña que venía de Norte
  // pintaría la app de Sur con la marca de Norte hasta que llegue el fetch.
  it('ignores a cached config that belongs to another tenant', async () => {
    persist({ slug: 'sur', config: { ...norteConfig, slug: 'sur' } })

    const { useTenantStore } = await loadStore()

    expect(useTenantStore.getState().config).toBeNull()
  })

  it.each([
    ['a config with the wrong shape', { slug: 'norte', config: { slug: 'norte' } }],
    ['a config that is not an object', { slug: 'norte', config: 'norte' }],
    ['an entry with no slug', { config: norteConfig }],
    ['null', null],
  ])('starts without config when the stored value is %s', async (_name, stored) => {
    persist(stored)

    const { useTenantStore } = await loadStore()

    expect(useTenantStore.getState().config).toBeNull()
  })

  it('keeps the config the app receives from the backend', async () => {
    const { setTenantConfig, useTenantStore } = await loadStore()

    setTenantConfig(norteConfig)

    expect(useTenantStore.getState().config).toEqual(norteConfig)
  })
})
