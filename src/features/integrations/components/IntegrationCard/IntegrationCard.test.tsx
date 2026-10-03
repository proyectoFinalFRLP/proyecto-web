import { screen } from '@testing-library/react'
import type { IntegrationService } from 'shared/api'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'

import { IntegrationCard } from './IntegrationCard'

function service(overrides: Partial<IntegrationService> = {}): IntegrationService {
  return {
    serviceId: 7,
    name: 'Shopify',
    type: 'ecommerce',
    configured: true,
    isActive: true,
    integrationId: 3,
    accountName: 'Tienda Norte',
    lastSyncedAt: null,
    ...overrides,
  }
}

describe('IntegrationCard', () => {
  it('shows the status and the connected account', () => {
    renderWithTheme(<IntegrationCard service={service()} />)

    expect(screen.getByText('Conectado')).toBeInTheDocument()
    expect(screen.getByText('Cuenta: Tienda Norte')).toBeInTheDocument()
  })

  it('tells a configured but paused integration apart from a connected one', () => {
    renderWithTheme(<IntegrationCard service={service({ isActive: false })} />)

    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('shows no account when the company is not connected', () => {
    renderWithTheme(<IntegrationCard service={service({ configured: false, isActive: false })} />)

    expect(screen.getByText('No conectado')).toBeInTheDocument()
    expect(screen.queryByText(/Cuenta:/)).not.toBeInTheDocument()
  })

  // Las conexiones las carga el equipo de OneStock desde el backoffice (ADR-018).
  it('offers no action to connect or change the integration', () => {
    renderWithTheme(<IntegrationCard service={service()} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
