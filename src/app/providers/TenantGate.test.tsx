import { fireEvent, screen } from '@testing-library/react'
import type { TenantConfig } from 'shared/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../test/renderWithTheme'

import { TenantGate } from './TenantGate'

// Sólo interesa en cuál de sus tres estados está el pedido de config; el pedido
// en sí ya se prueba del lado del cliente HTTP.
const tenantConfigQuery = vi.hoisted(() => ({
  isError: false,
  isFetching: false,
  error: null as { status?: number } | null,
  refetch: vi.fn(),
}))

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
  tenantConfigQuery.error = null
  tenantConfigQuery.refetch.mockReset()
})

/** El pedido de config falló con este status (sin status: red, respuesta inválida). */
function failWith(status?: number) {
  tenantConfigQuery.isError = true
  tenantConfigQuery.error = status === undefined ? {} : { status }
}

function renderGate() {
  renderWithTheme(
    <TenantGate>
      <p>panel</p>
    </TenantGate>,
  )
}

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
    failWith(404)

    renderWithTheme(
      <TenantGate>
        <p>panel</p>
      </TenantGate>,
    )

    expect(screen.getByText('No encontramos esta empresa')).toBeInTheDocument()
    expect(screen.getByText('Identificador buscado: ninguna')).toBeInTheDocument()
  })

  // Hallazgo de auditoría (TESIS-89): cualquier falla de `/tenant-config`
  // tapaba la app con «No encontramos esta empresa».
  describe('when the config request fails for another reason', () => {
    it('keeps the app running with the config it already had', async () => {
      await setTenant({ slug: 'norte', config: norteConfig })
      failWith(500)

      renderGate()

      expect(screen.getByText('panel')).toBeInTheDocument()
    })

    it('offers to retry instead of saying the tenant does not exist', async () => {
      await setTenant({ slug: 'norte', config: null })
      failWith(500)

      renderGate()

      expect(screen.getByText('No pudimos conectarnos')).toBeInTheDocument()
      expect(screen.queryByText('No encontramos esta empresa')).not.toBeInTheDocument()
    })

    it('asks for the config again on retry', async () => {
      await setTenant({ slug: 'norte', config: null })
      failWith()
      renderGate()

      fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(tenantConfigQuery.refetch).toHaveBeenCalled()
    })
  })
})
