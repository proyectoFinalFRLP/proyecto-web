import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { notify, useOrderDraftStore } from 'shared/store'
import type * as sharedStore from 'shared/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import * as api from '../api'
import { useDraftQuotes } from '../hooks/useDraftQuotes'
import type { OrderDetail, Shipment, ShippingQuote } from '../types'

import { CarrierStepPage } from './CarrierStepPage'

vi.mock('../hooks/useDraftQuotes', () => ({ useDraftQuotes: vi.fn() }))
vi.mock('shared/store', async (importOriginal) => ({
  ...(await importOriginal<typeof sharedStore>()),
  notify: vi.fn(),
}))

const ITEMS: sharedStore.OrderDraftItem[] = [
  {
    productId: 12,
    sku: 'PX-9021-LRG',
    name: 'Router industrial de alta densidad',
    category: 'Electronics',
    weight: 1.2,
    unitPrice: 120000,
    quantity: 4,
  },
]

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
    estimatedDays: null,
  },
]

const ORDER = { id: 8829 } as OrderDetail
const SHIPMENT = { id: 31 } as Shipment

function mockQuotes(state: Partial<ReturnType<typeof useDraftQuotes>> = {}) {
  const refetch = vi.fn()
  vi.mocked(useDraftQuotes).mockReturnValue({
    data: QUOTES,
    isPending: false,
    isError: false,
    refetch,
    ...state,
  } as never)
  return refetch
}

function fillDraft({ shipping = true } = {}) {
  const store = useOrderDraftStore.getState()
  store.setCustomer({ firstName: 'Marina', lastName: 'Rodríguez', document: '20-31298744-9' })
  ITEMS.forEach((item) => store.addItem(item))
  if (!shipping) return
  store.setOrigin({ warehouseId: 1, name: 'CD Ezeiza' })
  store.setDestination({
    address: 'Av. Corrientes 3247',
    city: 'CABA',
    province: 'Ciudad Autónoma de Buenos Aires',
    zipCode: '1193',
  })
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })

  return renderWithTheme(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/orders/new/carrier']}>
        <Routes>
          <Route path="/orders/new/carrier" element={<CarrierStepPage />} />
          <Route path="/orders/new/shipping" element={<h1>Paso 2</h1>} />
          <Route path="/orders/new" element={<h1>Paso 1</h1>} />
          <Route path="/orders/:orderId" element={<h1>Detalle</h1>} />
          <Route path="/orders" element={<h1>Listado</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const option = (name: RegExp) => screen.getByRole('radio', { name })
const confirmButton = () => screen.getByRole('button', { name: /Confirmar orden/ })
const total = () => screen.getByLabelText('Total final')

function stubConfirmation() {
  return {
    createOrder: vi.spyOn(api, 'createOrder').mockResolvedValue(ORDER),
    createShipment: vi.spyOn(api, 'createOrderShipment').mockResolvedValue(SHIPMENT),
    dispatch: vi.spyOn(api, 'dispatchShipment').mockResolvedValue(SHIPMENT),
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.mocked(notify).mockClear()
  sessionStorage.clear()
  useOrderDraftStore.getState().clearDraft()
  fillDraft()
  mockQuotes()
})

describe('CarrierStepPage', () => {
  it('marks step 3 as the active one', () => {
    renderPage()

    expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument()
  })

  // Criterio de la card: al entrar se ve un estado de carga mientras cotiza.
  it('says it is asking the carriers while the quote travels', () => {
    mockQuotes({ data: undefined, isPending: true })
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Consultando a los operadores logísticos')
  })

  // La cotización se pide sobre el borrador, sin crear la orden (TESIS-131).
  it('quotes the draft, not an order', () => {
    const createOrder = vi.spyOn(api, 'createOrder')
    renderPage()

    expect(vi.mocked(useDraftQuotes)).toHaveBeenLastCalledWith({
      quote: {
        origin_warehouse_id: 1,
        destination_zip_code: '1193',
        destination_address: 'Av. Corrientes 3247',
        items: [{ product_id: 12, quantity: 4 }],
      },
    })
    expect(createOrder).not.toHaveBeenCalled()
  })

  // Criterio de la card: el listado sale de la respuesta, sea cual sea su largo.
  it('offers exactly the options the quote returned', () => {
    renderPage()

    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(option(/Correo Argentino/)).toHaveTextContent('Entrega en 5 días')
    expect(option(/Andreani/)).toHaveTextContent('Plazo no informado')
  })

  it('flags the cheapest option, which comes first', () => {
    renderPage()

    expect(within(option(/Correo Argentino/)).getByText('Más económico')).toBeInTheDocument()
    expect(within(option(/Andreani/)).queryByText('Más económico')).not.toBeInTheDocument()
  })

  // Criterio de la card: el envío elegido se suma al total a la vista.
  it('adds the chosen shipping to the total', () => {
    renderPage()
    expect(total()).toHaveTextContent('480.000,00')

    fireEvent.click(option(/Andreani/))

    expect(total()).toHaveTextContent('538.300,00')
    expect(option(/Andreani/)).toHaveAttribute('aria-checked', 'true')
  })

  it('does not confirm before a carrier is chosen', () => {
    renderPage()

    expect(confirmButton()).toBeDisabled()
  })

  // Criterio de la card: sin cotizaciones se puede reintentar o revisar los datos.
  describe('when no carrier could quote', () => {
    it('says so and offers to quote again', () => {
      const refetch = mockQuotes({ data: [] })
      renderPage()

      expect(screen.getByText(/Ningún operador logístico pudo cotizar/)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Volver a cotizar' }))
      expect(refetch).toHaveBeenCalled()
    })

    it('lets the operator go back to review origin and destination', () => {
      mockQuotes({ data: [] })
      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Revisar origen y destino' }))

      expect(screen.getByRole('heading', { name: 'Paso 2' })).toBeInTheDocument()
    })
  })

  it('tells a failed quote apart from an empty one', () => {
    mockQuotes({ data: undefined, isError: true })
    renderPage()

    expect(screen.getByText('No pudimos cotizar el envío.')).toBeInTheDocument()
  })

  describe('confirming', () => {
    // Criterio de la card: se crea la orden y se vuelve al listado con éxito.
    it('creates the order, opens its shipment and dispatches it with the chosen carrier', async () => {
      const calls = stubConfirmation()
      renderPage()

      fireEvent.click(option(/Andreani/))
      fireEvent.click(confirmButton())

      expect(await screen.findByRole('heading', { name: 'Listado' })).toBeInTheDocument()
      expect(calls.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({
            customer_name: 'Marina Rodríguez',
            items: [{ product_id: 12, warehouse_id: 1, quantity: 4, unit_price: 120000 }],
          }),
        }),
      )
      expect(calls.createShipment).toHaveBeenCalledWith(8829)
      // La integración que despacha, no la que cotizó; y el costo que se eligió.
      expect(calls.dispatch).toHaveBeenCalledWith(31, {
        dispatch: { company_integration_id: 4, origin_warehouse_id: 1, shipping_cost: 58300 },
      })
    })

    it('announces the order and empties the draft', async () => {
      stubConfirmation()
      renderPage()

      fireEvent.click(option(/Andreani/))
      fireEvent.click(confirmButton())

      await screen.findByRole('heading', { name: 'Listado' })
      expect(notify).toHaveBeenCalledWith(
        'Orden #8829 creada y despachada con Andreani.',
        'success',
      )
      expect(useOrderDraftStore.getState().items).toEqual([])
    })

    it('keeps the draft when the order itself is rejected', async () => {
      vi.spyOn(api, 'createOrder').mockRejectedValue(new Error('Stock insuficiente'))
      renderPage()

      fireEvent.click(option(/Andreani/))
      fireEvent.click(confirmButton())

      expect(
        await screen.findByText(/No pudimos crear la orden\. Stock insuficiente/),
      ).toBeInTheDocument()
      expect(useOrderDraftStore.getState().items).toHaveLength(1)
    })

    // La orden ya existe y ya descontó el stock: reintentar no puede crear otra.
    describe('when the dispatch fails after the order was created', () => {
      function failDispatchOnce() {
        const calls = stubConfirmation()
        calls.dispatch.mockReset()
        calls.dispatch.mockRejectedValueOnce(new Error('El courier no contestó.'))
        calls.dispatch.mockResolvedValueOnce(SHIPMENT)
        return calls
      }

      it('says the order exists and what failed', async () => {
        failDispatchOnce()
        renderPage()

        fireEvent.click(option(/Andreani/))
        fireEvent.click(confirmButton())

        expect(
          await screen.findByText(/La orden #8829 se creó, pero no pudimos emitir el despacho/),
        ).toBeInTheDocument()
      })

      it('empties the draft, so a reload cannot create the same sale twice', async () => {
        failDispatchOnce()
        renderPage()

        fireEvent.click(option(/Andreani/))
        fireEvent.click(confirmButton())

        await screen.findByText(/se creó, pero/)
        expect(useOrderDraftStore.getState().items).toEqual([])
        // Y la pantalla sigue en pie con lo que se estaba confirmando.
        expect(option(/Andreani/)).toBeInTheDocument()
      })

      it('retries only the dispatch', async () => {
        const calls = failDispatchOnce()
        renderPage()

        fireEvent.click(option(/Andreani/))
        fireEvent.click(confirmButton())
        fireEvent.click(await screen.findByRole('button', { name: 'Reintentar el despacho' }))

        await screen.findByRole('heading', { name: 'Listado' })
        expect(calls.createOrder).toHaveBeenCalledTimes(1)
        expect(calls.dispatch).toHaveBeenCalledTimes(2)
      })

      it('no longer offers going back to a draft that is already an order', async () => {
        failDispatchOnce()
        renderPage()

        fireEvent.click(option(/Andreani/))
        fireEvent.click(confirmButton())

        await screen.findByText(/se creó, pero/)
        expect(screen.queryByRole('button', { name: 'Paso anterior' })).not.toBeInTheDocument()
      })

      it('links to the order that was created', async () => {
        failDispatchOnce()
        renderPage()

        fireEvent.click(option(/Andreani/))
        fireEvent.click(confirmButton())
        fireEvent.click(await screen.findByRole('button', { name: 'Ver la orden' }))

        expect(screen.getByRole('heading', { name: 'Detalle' })).toBeInTheDocument()
      })
    })
  })

  describe('reached without a complete draft', () => {
    it('sends the operator back to step 1 without a customer or lines', () => {
      useOrderDraftStore.getState().clearDraft()
      renderPage()

      expect(screen.getByRole('heading', { name: 'Paso 1' })).toBeInTheDocument()
    })

    it('sends the operator back to step 2 without origin or destination', () => {
      useOrderDraftStore.getState().clearDraft()
      fillDraft({ shipping: false })
      renderPage()

      expect(screen.getByRole('heading', { name: 'Paso 2' })).toBeInTheDocument()
    })
  })

  it('goes back to step 2', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Paso anterior' }))

    return waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Paso 2' })).toBeInTheDocument(),
    )
  })
})
