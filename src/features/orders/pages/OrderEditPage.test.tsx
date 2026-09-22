import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { useCatalogProducts } from '../hooks/useCatalogProducts'
import { useOrder, useOrderShipment } from '../hooks/useOrderDetail'
import { useOriginWarehouses } from '../hooks/useOriginWarehouses'
import { useProductStocks } from '../hooks/useProductStocks'
import { useProvinces } from '../hooks/useProvinces'
import { useUpdateOrder } from '../hooks/useUpdateOrder'
import type * as UpdateOrderModule from '../hooks/useUpdateOrder'
import type { OrderDetail, OrderShipment, UpdateOrderPayload } from '../types'

import { OrderEditPage } from './OrderEditPage'

vi.mock('../hooks/useOrderDetail', () => ({ useOrder: vi.fn(), useOrderShipment: vi.fn() }))
vi.mock('../hooks/useOriginWarehouses', () => ({ useOriginWarehouses: vi.fn() }))
vi.mock('../hooks/useCatalogProducts', () => ({ useCatalogProducts: vi.fn() }))
vi.mock('../hooks/useProvinces', () => ({ useProvinces: vi.fn() }))
vi.mock('../hooks/useProductStocks', () => ({ useProductStocks: vi.fn() }))
vi.mock('../hooks/useUpdateOrder', async (importOriginal) => ({
  ...(await importOriginal<typeof UpdateOrderModule>()),
  useUpdateOrder: vi.fn(),
}))

const ORDER: OrderDetail = {
  id: 8829,
  externalOrderId: 'ORD-8829-X',
  customerName: 'Global Tech Solutions S.A.',
  customerDocument: '30-71234567-8',
  customerAddress: 'Av. Corrientes 3247',
  customerZipCode: '1193',
  customerCity: 'CABA',
  customerProvince: 'Ciudad Autónoma de Buenos Aires',
  status: 'pending',
  version: '"v1"',
  totalAmount: 1260000,
  lines: [
    {
      id: 1,
      productId: 12,
      sku: 'PRO-8812-A',
      productName: 'Nodo sensor industrial v3',
      quantity: 8,
      unitPrice: 120000,
      warehouseId: 3,
    },
    {
      id: 2,
      productId: 13,
      sku: 'PRO-2294-K',
      productName: 'Controlador Gateway Hub',
      quantity: 2,
      unitPrice: 150000,
      warehouseId: 3,
    },
  ],
  createdAt: '2026-08-12T12:42:00Z',
}

const NO_SHIPMENT: OrderShipment = { kind: 'none' }

let mutate: ReturnType<typeof vi.fn>
let refetch: ReturnType<typeof vi.fn>

function mockAll({
  order = ORDER,
  shipment = NO_SHIPMENT,
  error = null,
}: {
  order?: OrderDetail
  shipment?: OrderShipment
  error?: { status?: number; message: string } | null
} = {}) {
  refetch = vi.fn()
  mutate = vi.fn((_payload: UpdateOrderPayload, options?: { onSuccess?: () => void }) =>
    options?.onSuccess?.(),
  )
  vi.mocked(useOrder).mockReturnValue({
    data: order,
    isPending: false,
    isError: false,
    error: null,
    refetch,
  } as never)
  vi.mocked(useOrderShipment).mockReturnValue({ data: shipment } as never)
  vi.mocked(useOriginWarehouses).mockReturnValue({
    data: [{ id: 3, name: 'CD Ezeiza', address: 'Ruta 205', zipCode: '1804' }],
  } as never)
  vi.mocked(useCatalogProducts).mockReturnValue({ data: [], isPending: false } as never)
  vi.mocked(useProvinces).mockReturnValue({
    data: ['Buenos Aires', 'Ciudad Autónoma de Buenos Aires'],
    isPending: false,
    isError: false,
  } as never)
  // 2 unidades libres de cada producto en CD Ezeiza.
  vi.mocked(useProductStocks).mockReturnValue({
    stocks: [
      { productId: 12, quantities: { 3: 2 } },
      { productId: 13, quantities: { 3: 2 } },
    ],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })
  vi.mocked(useUpdateOrder).mockReturnValue({ mutate, isPending: false, error } as never)
}

function renderPage() {
  return renderWithTheme(
    <MemoryRouter initialEntries={['/orders/edit/8829']}>
      <Routes>
        <Route path="/orders/edit/:orderId" element={<OrderEditPage />} />
        <Route path="/orders/:orderId" element={<h1>Detalle</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

const saveButton = () => screen.getByRole('button', { name: 'Guardar cambios' })
const quantity = (sku: string) => screen.getByRole('spinbutton', { name: `Cantidad de ${sku}` })
const recalc = () => screen.getByRole('region', { name: 'Recálculo' })

function lastPayload(): UpdateOrderPayload {
  return mutate.mock.calls.at(-1)?.[0] as UpdateOrderPayload
}

beforeEach(() => mockAll())

describe('OrderEditPage', () => {
  it('shows the order being edited', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Modificar ORD-8829-X' })).toBeInTheDocument()
    expect(quantity('PRO-8812-A')).toHaveValue(8)
  })

  it('keeps Save disabled until something changes', () => {
    renderPage()

    expect(saveButton()).toBeDisabled()
  })

  // Criterio de la card: agregar o quitar ítems recalcula el total sin guardar.
  it('recalculates the new subtotal as lines change or leave', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Sumar una unidad de PRO-8812-A' }))
    expect(within(recalc()).getByText(/1\.380\.000/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quitar PRO-2294-K' }))
    expect(within(recalc()).getByText(/1\.080\.000/)).toBeInTheDocument()
  })

  // Criterio de la card: el estado elegido se ve en el acto en el encabezado.
  it('shows the chosen status in the header before saving', async () => {
    renderPage()

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Estado' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Pagada' }))

    const header = screen.getByRole('heading', { name: 'Modificar ORD-8829-X' }).parentElement
    expect(within(header as HTMLElement).getByText('Pagada')).toBeInTheDocument()
  })

  // Criterio de la card: guardar persiste y vuelve al detalle.
  it('saves the changes with the version it read and goes back to the detail', async () => {
    renderPage()
    fireEvent.change(quantity('PRO-8812-A'), { target: { value: '9' } })

    await waitFor(() => expect(saveButton()).toBeEnabled())
    fireEvent.click(saveButton())

    expect(useUpdateOrder).toHaveBeenCalledWith(8829, '"v1"')
    expect(lastPayload().order.items).toEqual([
      { id: 1, quantity: 9 },
      { id: 2, quantity: 2 },
    ])
    expect(await screen.findByRole('heading', { name: 'Detalle' })).toBeInTheDocument()
  })

  it('does not send the lines when only the header changed', async () => {
    renderPage()
    fireEvent.change(screen.getByRole('textbox', { name: 'Ciudad' }), {
      target: { value: 'Buenos Aires' },
    })

    await waitFor(() => expect(saveButton()).toBeEnabled())
    fireEvent.click(saveButton())

    expect(lastPayload().order).not.toHaveProperty('items')
    expect(lastPayload().order.customer_city).toBe('Buenos Aires')
  })

  // Criterio de la card: las validaciones bloquean el guardado.
  it('blocks saving with a missing customer', async () => {
    renderPage()

    fireEvent.change(screen.getByRole('textbox', { name: 'Cliente o razón social' }), {
      target: { value: '' },
    })
    expect(await screen.findByText('Ingresá el nombre del cliente.')).toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })

  it('blocks saving with a zip code that is not an Argentine one', async () => {
    renderPage()

    fireEvent.change(screen.getByRole('textbox', { name: 'Código postal' }), {
      target: { value: '12' },
    })
    expect(await screen.findByText(/Usá los 4 dígitos/)).toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })

  it('blocks saving a blank quantity', async () => {
    renderPage()
    fireEvent.change(quantity('PRO-8812-A'), { target: { value: '' } })

    await waitFor(() => expect(saveButton()).toBeDisabled())
  })

  // Hay 2 libres: la línea de 8 puede llegar a 10, no a 11.
  it('warns and blocks saving when a line asks for more than its warehouse has', async () => {
    renderPage()
    fireEvent.change(quantity('PRO-8812-A'), { target: { value: '11' } })

    expect(
      await screen.findByText('La línea PRO-8812-A supera el stock disponible en CD Ezeiza.'),
    ).toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })

  it('keeps a line that does not record its warehouse fixed', () => {
    mockAll({
      order: { ...ORDER, lines: [{ ...ORDER.lines[0], warehouseId: null }, ORDER.lines[1]] },
    })
    renderPage()

    expect(quantity('PRO-8812-A')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Quitar PRO-8812-A' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar PRO-2294-K' })).toBeEnabled()
  })

  it('does not let a cancelled order be modified', () => {
    mockAll({ order: { ...ORDER, status: 'cancelled' } })
    renderPage()

    expect(screen.getByText('La orden está cancelada: no se puede modificar.')).toBeInTheDocument()
    expect(quantity('PRO-8812-A')).toBeDisabled()
    expect(saveButton()).toBeDisabled()
  })

  it('does not let an order whose shipment already left be modified', () => {
    mockAll({
      shipment: {
        kind: 'single',
        shipment: {
          id: 31,
          orderId: 8829,
          status: 'in_transit',
          trackingNumber: 'AND-1',
          shippingCost: 58300,
          courier: { id: 4, serviceId: 7, name: 'Andreani' },
          events: [],
        },
      },
    })
    renderPage()

    expect(
      screen.getByText('El envío de la orden ya salió: no se puede modificar.'),
    ).toBeInTheDocument()
  })

  it('offers to reload when another operator changed the order', () => {
    mockAll({ error: { status: 412, message: 'stale' } })
    renderPage()

    expect(screen.getByText(/Otro operador modificó la orden/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Recargar la orden' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('shows what the backend rejected on any other error', () => {
    mockAll({ error: { status: 422, message: "insufficient stock for product 'PRO-1'" } })
    renderPage()

    expect(
      screen.getByText(/No se pudieron guardar los cambios\. insufficient stock/),
    ).toBeInTheDocument()
  })

  it('goes back to the detail without saving on Discard', async () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }))

    expect(await screen.findByRole('heading', { name: 'Detalle' })).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })
})
