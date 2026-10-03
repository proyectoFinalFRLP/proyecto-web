import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import type { Shipment } from '../types'

import { ShippingLabelField } from './ShippingLabelField'

const DISPATCHED: Shipment = {
  id: 31,
  orderId: 8829,
  status: 'in_transit',
  trackingNumber: 'AND-9920-X8829-Z',
  shippingCost: 58300,
  courier: { id: 4, serviceId: 7, name: 'Andreani' },
  labelUrl: 'https://andreani.test/etiquetas/AND-9920.pdf',
  events: [],
}

const PENDING: Shipment = {
  ...DISPATCHED,
  status: 'pending',
  trackingNumber: null,
  shippingCost: null,
  courier: null,
  labelUrl: null,
}

const printLink = () => screen.queryByRole('link', { name: 'Imprimir etiqueta' })

describe('ShippingLabelField', () => {
  it('links to the label the courier issued', () => {
    renderWithTheme(<ShippingLabelField shipment={DISPATCHED} />)

    expect(printLink()).toHaveAttribute('href', 'https://andreani.test/etiquetas/AND-9920.pdf')
  })

  // El destino es el sitio del courier, no una ruta de la app: se abre aparte y
  // sin entregarle la referencia a esta ventana.
  it('opens it in another tab without handing over this window', () => {
    renderWithTheme(<ShippingLabelField shipment={DISPATCHED} />)

    expect(printLink()).toHaveAttribute('target', '_blank')
    expect(printLink()).toHaveAttribute('rel', 'noopener noreferrer')
  })

  // La emite el courier al confirmar el despacho: antes de eso no existe, y un
  // campo vacío se leería como un dato perdido.
  it('says it is pending while the shipment was not dispatched', () => {
    renderWithTheme(<ShippingLabelField shipment={PENDING} />)

    expect(screen.getByText('Se emite al despachar.')).toBeInTheDocument()
    expect(printLink()).not.toBeInTheDocument()
  })

  it('says the same while there is no shipment at all', () => {
    renderWithTheme(<ShippingLabelField shipment={null} />)

    expect(screen.getByText('Se emite al despachar.')).toBeInTheDocument()
  })

  // Despachado y sin etiqueta es otra cosa: el courier no la devolvió, y
  // decirlo evita que el operador la espere.
  it('says the courier did not return one when the shipment already went out', () => {
    renderWithTheme(<ShippingLabelField shipment={{ ...DISPATCHED, labelUrl: null }} />)

    expect(screen.getByText('El operador no devolvió la etiqueta.')).toBeInTheDocument()
    expect(printLink()).not.toBeInTheDocument()
  })
})
