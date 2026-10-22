import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { IntegrationService } from 'shared/api'
import * as sharedApi from 'shared/api/integrations'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import * as api from '../../api'
import type { ProductMapping } from '../../types'

import { SalesChannelsCard } from './SalesChannelsCard'

const SHOPIFY: IntegrationService = {
  serviceId: 1,
  name: 'Shopify',
  type: 'ecommerce',
  configured: true,
  isActive: true,
  integrationId: 10,
  accountName: null,
  lastSyncedAt: null,
  stockSync: null,
}

function mapping(overrides: Partial<ProductMapping> = {}): ProductMapping {
  return {
    id: 4,
    companyIntegrationId: 10,
    serviceName: 'Shopify',
    externalProductId: '123',
    lastSyncedAt: null,
    lastSyncError: null,
    ...overrides,
  }
}

function requestError(status: number, message: string) {
  return Object.assign(new Error(message), { status })
}

function renderCard({
  mappings = [mapping()],
  integrations = [SHOPIFY],
}: { mappings?: ProductMapping[]; integrations?: IntegrationService[] } = {}) {
  const fetchMappings = vi.spyOn(api, 'fetchProductMappings').mockResolvedValue(mappings)
  vi.spyOn(sharedApi, 'fetchIntegrations').mockResolvedValue(integrations)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  renderWithTheme(
    <QueryClientProvider client={queryClient}>
      <SalesChannelsCard productId={5} />
    </QueryClientProvider>,
  )

  return { fetchMappings }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('SalesChannelsCard · stock sync', () => {
  it('tells when the stock was last published and hides the retry when it is up to date', async () => {
    renderCard({ mappings: [mapping({ lastSyncedAt: new Date().toISOString() })] })

    expect(await screen.findByText(/^Sincronizado /)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })

  it('shows why the stock did not reach the channel and offers a retry', async () => {
    renderCard({
      mappings: [mapping({ lastSyncedAt: new Date().toISOString(), lastSyncError: 'no location' })],
    })

    expect(await screen.findByText('No se pudo publicar el stock: no location')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('retries the channel and asks for the links again', async () => {
    const { fetchMappings } = renderCard()
    let finish: (value: ProductMapping) => void = () => {}
    const resync = vi
      .spyOn(api, 'resyncProductMapping')
      .mockReturnValue(new Promise((resolve) => (finish = resolve)))

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    // Mientras se encola, el botón no se puede volver a apretar.
    expect(await screen.findByRole('button', { name: 'Reintentando…' })).toBeDisabled()
    expect(resync).toHaveBeenCalledWith(5, 4)

    finish(mapping())

    await waitFor(() => expect(fetchMappings).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeEnabled()
  })

  it('shows the reason when the channel cannot publish', async () => {
    renderCard()
    vi.spyOn(api, 'resyncProductMapping').mockRejectedValue(
      requestError(422, 'the integration has no Ubicación de stock (location_id) configured'),
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo publicar el stock: the integration has no Ubicación de stock (location_id) configured',
    )
  })

  it('asks to wait a minute when the retries hit the limit', async () => {
    renderCard()
    vi.spyOn(api, 'resyncProductMapping').mockRejectedValue(requestError(429, 'Too many'))

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esperá un minuto antes de reintentar.',
    )
  })

  it('warns about a channel that cannot publish and about its unpublished products', async () => {
    renderCard({
      integrations: [
        {
          ...SHOPIFY,
          stockSync: {
            ready: false,
            missingSettings: [{ key: 'location_id', label: 'Ubicación de stock' }],
            failingProducts: 2,
            lastSyncError: 'boom',
            lastSyncedAt: null,
          },
        },
      ],
    })

    expect(await screen.findByText('Shopify no está publicando el stock')).toBeInTheDocument()
    expect(screen.getByText('Falta configurar: Ubicación de stock')).toBeInTheDocument()
    expect(screen.getByText('2 productos sin publicar')).toBeInTheDocument()
  })
})
