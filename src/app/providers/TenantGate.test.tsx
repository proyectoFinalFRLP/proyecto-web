import { screen } from '@testing-library/react'
import type { TenantConfig } from 'shared/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../test/renderWithTheme'

import { TenantGate } from './TenantGate'

// Sólo interesa en cuál de sus tres estados está el pedido de config; el pedido
// en sí ya se prueba del lado del cliente HTTP.
const tenantConfigQuery = vi.hoisted(() => ({ isError: false }))

vi.mock('shared/hooks/useTenantConfig', () => ({
  useTenantConfig: () => tenantConfigQuery,
}))

const norteConfig: TenantConfig = {
  slug: 'norte',
  name: 'Distribuidora Norte S.A.',
  branding: { display_name: 'Distribuidora Norte' },
  features: { integrations: true },
}

async function setTenant(state: { slug: string | null; config: TenantConfig | null }) {
  const { useTenantStore } = await import('shared/store')
  useTenantStore.setState(state)
}

beforeEach(() => {
  tenantConfigQuery.isError = false
})

describe('TenantGate', () => {
  it('holds the app behind a splash with the identity of the tenant', async () => {
    await setTenant({ slug: 'norte', config: null })

    renderWithTheme(
      <TenantGate>
        <p>panel</p>
      </TenantGate>,
    )

    expect(screen.getByText('Norte')).toBeInTheDocument()
    expect(screen.queryByText('panel')).not.toBeInTheDocument()
  })

  it('mounts the app once the config is available', async () => {
    await setTenant({ slug: 'norte', config: norteConfig })

    renderWithTheme(
      <TenantGate>
        <p>panel</p>
      </TenantGate>,
    )

    expect(screen.getByText('panel')).toBeInTheDocument()
  })

  it('says the tenant is unknown when the host does not name one', async () => {
    await setTenant({ slug: null, config: null })

    renderWithTheme(
      <TenantGate>
        <p>panel</p>
      </TenantGate>,
    )

    expect(screen.getByText('No encontramos esta empresa')).toBeInTheDocument()
    expect(screen.queryByText('panel')).not.toBeInTheDocument()
  })

  // Un slug inexistente o una empresa inactiva responden 404 (§3 del contrato).
  it('says the tenant is unknown when the backend does not recognise the slug', async () => {
    await setTenant({ slug: 'ninguna', config: null })
    tenantConfigQuery.isError = true

    renderWithTheme(
      <TenantGate>
        <p>panel</p>
      </TenantGate>,
    )

    expect(screen.getByText('No encontramos esta empresa')).toBeInTheDocument()
    expect(screen.getByText('Identificador buscado: ninguna')).toBeInTheDocument()
  })
})
