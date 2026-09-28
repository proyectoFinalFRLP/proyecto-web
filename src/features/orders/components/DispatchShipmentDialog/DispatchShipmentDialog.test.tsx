import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import * as api from '../../api'
import type { OrderLine, OriginWarehouse, Shipment, ShippingQuote } from '../../types'

import { DispatchShipmentDialog } from './DispatchShipmentDialog'

const EZEIZA: OriginWarehouse = {
  id: 1,
  name: 'CD Ezeiza',
  address: 'Ruta 205 km 32',
  zipCode: '1804',
}
const PACHECO: OriginWarehouse = {
  id: 2,
  name: 'CD Pacheco',
  address: 'Ruta 197 1450',
  zipCode: '1617',
}

function line(id: number, warehouseId: number | null): OrderLine {
  return {
    id,
    productId: 10 + id,
    sku: `SKU-${id}`,
    productName: `Producto ${id}`,
    quantity: 2,
    unitPrice: 1000,
    warehouseId,
  }
}

// Ordenadas por precio, como las devuelve la cotización.
const QUOTES: ShippingQuote[] = [
  {
    quoteIntegrationId: 8,
    dispatchIntegrationId: 5,
    providerName: 'Correo Argentino',
    shippingCost: 41200,
    estimatedDays: 5,
  },
  {
    quoteIntegrationId: 7,
    dispatchIntegrationId: 4,
    providerName: 'Andreani',
    shippingCost: 58300,
    estimatedDays: 2,
  },
]

const SHIPMENT = { id: 31 } as Shipment

function stubApi() {
  return {
    warehouses: vi.spyOn(api, 'fetchWarehouses').mockResolvedValue([EZEIZA, PACHECO]),
    quote: vi.spyOn(api, 'quoteOrder').mockResolvedValue(QUOTES),
    dispatch: vi.spyOn(api, 'dispatchShipment').mockResolvedValue(SHIPMENT),
  }
}

function renderDialog(lines: OrderLine[] = [line(1, 1), line(2, 1)]) {
  const onDispatched = vi.fn()
  const onClose = vi.fn()
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  renderWithTheme(
    <QueryClientProvider client={queryClient}>
      <DispatchShipmentDialog
        open
        orderId={8829}
        orderLabel="#8829"
        shipmentId={31}
        lines={lines}
        onClose={onClose}
        onDispatched={onDispatched}
      />
    </QueryClientProvider>,
  )

  return { onDispatched, onClose }
}

const option = (name: RegExp) => screen.findByRole('radio', { name })
const dispatchButton = () => screen.getByRole('button', { name: 'Despachar' })

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('DispatchShipmentDialog', () => {
  it('quotes the order from the warehouse its lines came out of, without asking', async () => {
    const calls = stubApi()
    renderDialog()

    await option(/Andreani/)

    expect(calls.quote).toHaveBeenCalledWith(8829, { quote: { origin_warehouse_id: 1 } })
    expect(screen.getByText('CD Ezeiza')).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /CD Pacheco/ })).not.toBeInTheDocument()
  })

  it('asks for the origin when the lines came out of more than one warehouse', async () => {
    const calls = stubApi()
    renderDialog([line(1, 1), line(2, 2)])

    fireEvent.click(await option(/CD Pacheco/))
    await option(/Andreani/)

    expect(calls.quote).toHaveBeenCalledTimes(1)
    expect(calls.quote).toHaveBeenCalledWith(8829, { quote: { origin_warehouse_id: 2 } })
  })

  it('does not quote before the origin is known', async () => {
    const calls = stubApi()
    renderDialog([line(1, null)])

    await option(/CD Ezeiza/)

    expect(calls.quote).not.toHaveBeenCalled()
    expect(screen.getByText(/Elegí el depósito de origen/)).toBeInTheDocument()
  })

  it('does not dispatch before an option is chosen', async () => {
    stubApi()
    renderDialog()

    await option(/Andreani/)

    expect(dispatchButton()).toBeDisabled()
  })

  // Criterio de la card: despacha con la integración que despacha, no con la
  // que cotiza, con su costo y el depósito de origen.
  it('dispatches the chosen option with the integration that dispatches, its cost and the origin', async () => {
    const calls = stubApi()
    const { onDispatched } = renderDialog()

    fireEvent.click(await option(/Andreani/))
    fireEvent.click(dispatchButton())

    await waitFor(() => expect(onDispatched).toHaveBeenCalledWith('Andreani'))
    expect(calls.dispatch).toHaveBeenCalledWith(31, {
      dispatch: { company_integration_id: 4, origin_warehouse_id: 1, shipping_cost: 58300 },
    })
  })

  // Criterio de la card: si el despacho vuelve a fallar, el error lo dice y se
  // puede reintentar sin salir del detalle.
  describe('when the dispatch fails again', () => {
    function failOnce() {
      const calls = stubApi()
      calls.dispatch.mockReset()
      calls.dispatch.mockRejectedValueOnce(new Error('El courier no contestó.'))
      calls.dispatch.mockResolvedValueOnce(SHIPMENT)
      return calls
    }

    it('says so, with what the api answered', async () => {
      failOnce()
      renderDialog()

      fireEvent.click(await option(/Andreani/))
      fireEvent.click(dispatchButton())

      expect(
        await screen.findByText('No pudimos emitir el despacho. El courier no contestó.'),
      ).toBeInTheDocument()
    })

    it('retries without leaving the dialog', async () => {
      const calls = failOnce()
      const { onDispatched, onClose } = renderDialog()

      fireEvent.click(await option(/Andreani/))
      fireEvent.click(dispatchButton())
      fireEvent.click(await screen.findByRole('button', { name: 'Reintentar el despacho' }))

      await waitFor(() => expect(onDispatched).toHaveBeenCalledWith('Andreani'))
      expect(calls.dispatch).toHaveBeenCalledTimes(2)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  it('does not offer to retry a shipment that was dispatched meanwhile', async () => {
    const calls = stubApi()
    calls.dispatch.mockRejectedValue(
      Object.assign(new Error('Shipment already dispatched'), { status: 409 }),
    )
    renderDialog()

    fireEvent.click(await option(/Andreani/))
    fireEvent.click(dispatchButton())

    expect(await screen.findByText(/El envío ya se despachó mientras tanto/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reintentar el despacho' })).not.toBeInTheDocument()
    expect(calls.dispatch).toHaveBeenCalledTimes(1)
  })

  it('offers to look for the warehouses again when they could not be loaded', async () => {
    const calls = stubApi()
    calls.warehouses.mockRejectedValueOnce(new Error('boom'))
    renderDialog()

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    await option(/Andreani/)
    expect(calls.warehouses).toHaveBeenCalledTimes(2)
  })
})
