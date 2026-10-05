import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import type { ActivityEntry } from '../../api/activity'
import { useActivity } from '../../hooks/useActivity'

import { ActivityPanel } from './ActivityPanel'

vi.mock('../../hooks/useActivity', () => ({ useActivity: vi.fn() }))

function entry(overrides: Partial<ActivityEntry> = {}): ActivityEntry {
  return {
    id: 'order-8829',
    type: 'order_created',
    occurredAt: '2026-10-02T14:20:00Z',
    orderId: 8829,
    customerName: 'Marina Rodríguez',
    externalOrderId: null,
    shipmentId: null,
    trackingNumber: null,
    courier: null,
    eventType: null,
    integration: null,
    ...overrides,
  }
}

function mockFeed(entries: ActivityEntry[]) {
  vi.mocked(useActivity).mockReturnValue({
    data: entries,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as never)
}

// Las rutas llegan por props: `shared/` no puede importar el router.
const PATHS = { order: (id: number) => `/orders/${id}` }

function renderPanel(paths: typeof PATHS & { failedEvents?: string } = PATHS) {
  const anchor = document.createElement('button')
  document.body.appendChild(anchor)

  return renderWithTheme(
    <MemoryRouter>
      <ActivityPanel anchorEl={anchor} onClose={vi.fn()} paths={paths} />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(useActivity).mockReset()
  mockFeed([entry()])
})

describe('ActivityPanel', () => {
  it('reads each fact of the feed as a sentence', () => {
    renderPanel()

    expect(screen.getByText('Nueva orden de Marina Rodríguez')).toBeInTheDocument()
  })

  it('tells a channel sale apart by its reference', () => {
    mockFeed([entry({ externalOrderId: 'ML-1001' })])
    renderPanel()

    expect(screen.getByText(/ML-1001/)).toBeInTheDocument()
  })

  it('names the courier of a dispatch', () => {
    mockFeed([entry({ type: 'shipment_dispatched', courier: 'Andreani' })])
    renderPanel()

    expect(screen.getByText('Envío despachado con Andreani')).toBeInTheDocument()
  })

  it('takes a sale to the detail of its order', () => {
    renderPanel()

    expect(screen.getByRole('link', { name: /Nueva orden/ })).toHaveAttribute(
      'href',
      '/orders/8829',
    )
  })

  // Una fila que informa y nada más no tiene que prometer una acción:
  // `ListItemButton` se anuncia como botón aunque se lo monte sobre un `div`.
  describe('a row with nowhere to go', () => {
    // La pantalla de eventos fallidos no se le pasa al panel.
    const failure = entry({ id: 'failure-1', type: 'event_failed', orderId: null })

    it('is not announced as something that can be activated', () => {
      mockFeed([failure])
      renderPanel()

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('is still shown, with its sentence', () => {
      mockFeed([failure])
      renderPanel()

      expect(screen.getByText('Falló un evento de integración')).toBeInTheDocument()
    })

    // Control negativo: con la pantalla cargada, esa misma fila sí enlaza.
    it('becomes a link once the screen it needs exists', () => {
      mockFeed([failure])
      renderPanel({ ...PATHS, failedEvents: '/failed-events' })

      expect(screen.getByRole('link', { name: /Falló un evento/ })).toHaveAttribute(
        'href',
        '/failed-events',
      )
    })
  })
})
