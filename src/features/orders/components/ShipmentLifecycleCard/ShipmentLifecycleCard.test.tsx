import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { Shipment } from '../../types'

import { ShipmentLifecycleCard } from './ShipmentLifecycleCard'

const SHIPMENT: Shipment = {
  id: 31,
  orderId: 8829,
  status: 'in_transit',
  trackingNumber: 'AND-9920-X8829-Z',
  shippingCost: 58300,
  courier: { id: 4, serviceId: 7, name: 'Andreani' },
  events: [
    {
      id: 1,
      internalStatus: 'pending',
      externalStatus: 'Pedido recibido',
      description: null,
      occurredAt: '2026-08-12T09:42:00-03:00',
    },
    {
      id: 2,
      internalStatus: 'ready_to_ship',
      externalStatus: 'Listo en CD Ezeiza',
      description: null,
      occurredAt: '2026-08-13T14:00:00-03:00',
    },
    {
      id: 3,
      internalStatus: 'in_transit',
      externalStatus: 'En viaje a sucursal destino',
      description: null,
      occurredAt: '2026-08-15T08:30:00-03:00',
    },
  ],
}

describe('ShipmentLifecycleCard', () => {
  it('shows the four stages of the cycle, marking the current one', () => {
    renderWithTheme(<ShipmentLifecycleCard shipment={{ kind: 'single', shipment: SHIPMENT }} />)

    const stages = within(screen.getByRole('list', { name: 'Etapas del envío' })).getAllByRole(
      'listitem',
    )

    expect(stages.map((stage) => stage.textContent)).toEqual([
      expect.stringContaining('Pendiente'),
      expect.stringContaining('Listo para despachar'),
      expect.stringContaining('En tránsito'),
      expect.stringContaining('Entregado'),
    ])
    expect(stages[2]).toHaveAttribute('aria-current', 'step')
  })

  it('dates each reached stage and leaves the next one pending', () => {
    renderWithTheme(<ShipmentLifecycleCard shipment={{ kind: 'single', shipment: SHIPMENT }} />)

    const stages = within(screen.getByRole('list', { name: 'Etapas del envío' })).getAllByRole(
      'listitem',
    )

    expect(stages[2]).toHaveTextContent(/15 ago\.? · 08:30/)
    expect(stages[3]).toHaveTextContent('EntregadoPendiente')
  })

  // Criterio de la card: la bitácora refleja los ShipmentEvents por occurred_at,
  // con el estado normalizado y el texto crudo del courier.
  it('lists the courier log newest first, with the raw and the normalized status', () => {
    renderWithTheme(<ShipmentLifecycleCard shipment={{ kind: 'single', shipment: SHIPMENT }} />)

    const log = screen.getAllByRole('list').at(-1)
    const entries = within(log as HTMLElement).getAllByRole('listitem')

    expect(entries.map((entry) => entry.textContent)).toEqual([
      expect.stringMatching(/^En viaje a sucursal destinoEn tránsito · 15 ago\.? · 08:30$/),
      expect.stringMatching(/^Listo en CD EzeizaListo para despachar · 13 ago\.? · 14:00$/),
      expect.stringMatching(/^Pedido recibidoPendiente · 12 ago\.? · 09:42$/),
    ])
  })

  it('reports the progress of the shipment', () => {
    renderWithTheme(<ShipmentLifecycleCard shipment={{ kind: 'single', shipment: SHIPMENT }} />)

    expect(screen.getByRole('progressbar', { name: 'Avance del envío' })).toHaveAttribute(
      'aria-valuenow',
      '67',
    )
  })

  it('says the courier has not reported anything yet', () => {
    renderWithTheme(
      <ShipmentLifecycleCard
        shipment={{ kind: 'single', shipment: { ...SHIPMENT, status: 'pending', events: [] } }}
      />,
    )

    expect(
      screen.getByText('El operador logístico todavía no reportó eventos.'),
    ).toBeInTheDocument()
  })

  it('says the order has no shipment yet', () => {
    renderWithTheme(<ShipmentLifecycleCard shipment={{ kind: 'none' }} />)

    expect(screen.getByText('La orden todavía no tiene un envío creado.')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  // Restricción 1:1 de la card: con más de un envío no se elige ninguno.
  it('warns about a duplicated shipment instead of showing one of them', () => {
    renderWithTheme(<ShipmentLifecycleCard shipment={{ kind: 'duplicated', count: 2 }} />)

    expect(screen.getByRole('alert')).toHaveTextContent('La orden tiene 2 envíos registrados')
    expect(screen.queryByRole('list', { name: 'Etapas del envío' })).not.toBeInTheDocument()
  })

  it('offers to retry when the shipment could not be loaded', () => {
    const onRetry = vi.fn()
    renderWithTheme(<ShipmentLifecycleCard shipment={{ kind: 'error', onRetry }} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
