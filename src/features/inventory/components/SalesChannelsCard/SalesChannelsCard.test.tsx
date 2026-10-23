import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { IntegrationService } from 'shared/api'
import * as sharedApi from 'shared/api/integrations'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
  const fetchIntegrations = vi.spyOn(sharedApi, 'fetchIntegrations').mockResolvedValue(integrations)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  renderWithTheme(
    <QueryClientProvider client={queryClient}>
      <SalesChannelsCard productId={5} />
    </QueryClientProvider>,
  )

  return { fetchMappings, fetchIntegrations, queryClient }
}

const BEFORE = '2026-10-23T10:00:00Z'
const failed = (overrides: Partial<ProductMapping> = {}) =>
  mapping({ lastSyncedAt: BEFORE, lastSyncError: 'boom', ...overrides })

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
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

  it('retries the channel, shows «Publicando…» and polls until the job writes the result', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { fetchMappings, fetchIntegrations } = renderCard({ mappings: [failed()] })
    let finish: (value: ProductMapping) => void = () => {}
    const resync = vi
      .spyOn(api, 'resyncProductMapping')
      .mockReturnValue(new Promise((resolve) => (finish = resolve)))

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    // Mientras se encola, el botón no se puede volver a apretar.
    expect(await screen.findByRole('button', { name: 'Reintentando…' })).toBeDisabled()
    expect(resync).toHaveBeenCalledWith(5, 4)

    finish(failed())

    // El job todavía no corrió: el error viejo deja lugar a «Publicando…».
    expect(await screen.findByText('Publicando…')).toBeInTheDocument()
    expect(screen.queryByText(/boom/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reintent/ })).not.toBeInTheDocument()

    const polled = fetchMappings.mock.calls.length
    await vi.advanceTimersByTimeAsync(2_000)
    expect(fetchMappings.mock.calls.length).toBeGreaterThan(polled)
    expect(screen.getByText('Publicando…')).toBeInTheDocument()

    // El job escribe el intento nuevo.
    const integrationCalls = fetchIntegrations.mock.calls.length
    fetchMappings.mockResolvedValue([mapping({ lastSyncedAt: new Date().toISOString() })])
    await vi.advanceTimersByTimeAsync(2_000)

    expect(await screen.findByText(/^Sincronizado /)).toBeInTheDocument()
    expect(screen.queryByText('Publicando…')).not.toBeInTheDocument()
    // Y se pide de nuevo el aviso de arriba («N productos sin publicar»).
    await waitFor(() =>
      expect(fetchIntegrations.mock.calls.length).toBeGreaterThan(integrationCalls),
    )

    // Con el resultado escrito se deja de preguntar.
    const settled = fetchMappings.mock.calls.length
    await vi.advanceTimersByTimeAsync(10_000)
    expect(fetchMappings).toHaveBeenCalledTimes(settled)
  })

  it('stops polling after the timeout and shows the last known result again', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { fetchMappings, fetchIntegrations } = renderCard({ mappings: [failed()] })
    vi.spyOn(api, 'resyncProductMapping').mockResolvedValue(failed())

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Publicando…')).toBeInTheDocument()

    const integrationCalls = fetchIntegrations.mock.calls.length
    await vi.advanceTimersByTimeAsync(30_000)

    expect(await screen.findByText('No se pudo publicar el stock: boom')).toBeInTheDocument()
    expect(
      screen.getByText(
        'El canal todavía no confirmó la publicación. Mirá de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
    await waitFor(() =>
      expect(fetchIntegrations.mock.calls.length).toBeGreaterThan(integrationCalls),
    )

    const stopped = fetchMappings.mock.calls.length
    await vi.advanceTimersByTimeAsync(10_000)
    expect(fetchMappings).toHaveBeenCalledTimes(stopped)
  })

  it('shows «Publicando…» for a freshly linked channel instead of offering a retry', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { fetchMappings } = renderCard({ mappings: [] })
    const linked = mapping({ id: 9 })
    vi.spyOn(api, 'linkProduct').mockResolvedValue({ mapping: linked, warnings: [] })

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    fireEvent.click(await screen.findByRole('option', { name: 'Shopify' }))
    fetchMappings.mockResolvedValue([linked])
    fireEvent.click(screen.getByRole('button', { name: 'Vincular' }))

    expect(await screen.findByText('Publicando…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()

    fetchMappings.mockResolvedValue([{ ...linked, lastSyncedAt: new Date().toISOString() }])
    await vi.advanceTimersByTimeAsync(2_000)

    expect(await screen.findByText(/^Sincronizado /)).toBeInTheDocument()
  })

  it('keeps the state of each channel when two retries overlap', async () => {
    const tiendanube = failed({ id: 6, companyIntegrationId: 11, serviceName: 'Tiendanube' })
    renderCard({ mappings: [failed(), tiendanube] })
    let rejectShopify: (error: Error) => void = () => {}
    vi.spyOn(api, 'resyncProductMapping').mockImplementation((_productId, mappingId) =>
      mappingId === 4
        ? new Promise((_resolve, reject) => (rejectShopify = reject))
        : Promise.resolve(tiendanube),
    )

    const [shopifyRetry] = await screen.findAllByRole('button', { name: 'Reintentar' })
    fireEvent.click(shopifyRetry)
    expect(await screen.findByRole('button', { name: 'Reintentando…' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Publicando…')).toBeInTheDocument()

    // El reintento de Tiendanube terminó, pero el de Shopify sigue en vuelo.
    expect(screen.getByRole('button', { name: 'Reintentando…' })).toBeDisabled()

    rejectShopify(requestError(429, 'Too many'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esperá un minuto antes de reintentar.',
    )
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
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

  it('drops the rejection once a later refetch brings a new attempt', async () => {
    const { fetchMappings, queryClient } = renderCard({ mappings: [failed()] })
    vi.spyOn(api, 'resyncProductMapping').mockRejectedValue(
      requestError(422, 'Shopify cannot publish stock: the integration has no location'),
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))
    // El motivo del back ya se explica solo: va sin el prefijo.
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /^Shopify cannot publish stock: the integration has no location$/,
    )

    fetchMappings.mockResolvedValue([mapping({ lastSyncedAt: new Date().toISOString() })])
    await queryClient.invalidateQueries()

    expect(await screen.findByText(/^Sincronizado /)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('asks to wait a minute when the retries hit the limit', async () => {
    renderCard()
    vi.spyOn(api, 'resyncProductMapping').mockRejectedValue(requestError(429, 'Too many'))

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esperá un minuto antes de reintentar.',
    )
  })

  it('tells when the link no longer exists', async () => {
    renderCard()
    vi.spyOn(api, 'resyncProductMapping').mockRejectedValue(requestError(404, 'Not Found'))

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ese vínculo ya no existe. Recargá la página.',
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
    // Es un estado, no un evento: no se anuncia como alerta en cada carga.
    expect(
      screen
        .getAllByRole('status')
        .some((node) => node.textContent?.includes('Shopify no está publicando el stock')),
    ).toBe(true)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Falta configurar: Ubicación de stock')).toBeInTheDocument()
    expect(screen.getByText('2 productos sin publicar')).toBeInTheDocument()
  })
})
