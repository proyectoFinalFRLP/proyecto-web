import type { TenantFeatureFlags } from 'shared/api'
import { describe, expect, it } from 'vitest'

import { navRoutesFor } from './routes'

function navPaths(features: TenantFeatureFlags | undefined) {
  return navRoutesFor(features).map((route) => route.path)
}

describe('navRoutesFor', () => {
  it('lists the sections of a feature the tenant has enabled', () => {
    expect(navPaths({ integrations: true })).toContain('/integrations')
  })

  it('hides them for a tenant that has the feature off', () => {
    expect(navPaths({ integrations: false })).not.toContain('/integrations')
  })

  // Un flag ausente es un flag apagado: la empresa que no compró la feature no
  // la tiene declarada, y el default no puede ser mostrarla.
  it('hides them when the config does not mention the feature at all', () => {
    expect(navPaths({})).not.toContain('/integrations')
    expect(navPaths(undefined)).not.toContain('/integrations')
  })

  it('keeps the sections that belong to the product for every tenant', () => {
    expect(navPaths({})).toEqual(['/', '/dashboard', '/inventory'])
  })

  it('never lists a route that has no place in the sidebar', () => {
    const paths = navPaths({ integrations: true })

    expect(paths).not.toContain('/login')
    expect(paths).not.toContain('/design-system')
  })
})
