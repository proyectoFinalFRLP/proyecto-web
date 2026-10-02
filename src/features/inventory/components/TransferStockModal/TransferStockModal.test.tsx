import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { Product, Warehouse } from '../../types'

import { TransferStockModal } from './TransferStockModal'

const CENTRAL: Warehouse = { id: 1, name: 'Central', address: 'Av. 7' }
const SATELITE: Warehouse = { id: 2, name: 'Satélite', address: 'Calle 25' }
const SUR: Warehouse = { id: 3, name: 'Sur', address: 'Av. Colón' }

const WAREHOUSES: Warehouse[] = [CENTRAL, SATELITE, SUR]

const PRODUCT: Product = {
  id: 7,
  sku: 'NOR-003',
  name: 'Mouse',
  description: null,
  category: null,
  weight: 0.1,
  dimensions: null,
  stocks: [
    { warehouseId: 1, quantity: 100, warehouse: CENTRAL, stockStatus: 'low' },
    // Sin unidades: no puede ser origen.
    { warehouseId: 2, quantity: 0, warehouse: SATELITE, stockStatus: 'out_of_stock' },
  ],
  totalStock: 100,
  stockStatus: 'low',
  inTransitQuantity: 0,
  inTransitByWarehouse: [],
  updatedAt: '2026-09-01T10:00:00Z',
  version: null,
}

function renderModal(props: Partial<Parameters<typeof TransferStockModal>[0]> = {}) {
  const onSubmit = vi.fn()
  renderWithTheme(
    <TransferStockModal
      open
      product={PRODUCT}
      warehouses={WAREHOUSES}
      onSubmit={onSubmit}
      onClose={vi.fn()}
      {...props}
    />,
  )
  return onSubmit
}

async function choose(field: string, option: RegExp) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: field }))
  fireEvent.click(await screen.findByRole('option', { name: option }))
}

function optionsOf(field: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: field }))
  return within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((option) => option.textContent)
}

function typeQuantity(value: string) {
  fireEvent.change(screen.getByRole('spinbutton', { name: /^Cantidad/ }), { target: { value } })
}

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Transferir' }))

describe('TransferStockModal', () => {
  it('offers as origin only the warehouses that hold units', () => {
    renderModal()

    expect(optionsOf('Depósito de origen')).toEqual(['—', 'Central · 100 u.'])
  })

  it('leaves the chosen origin out of the destinations', async () => {
    renderModal()
    await choose('Depósito de origen', /Central/)

    expect(optionsOf('Depósito de destino')).toEqual(['—', 'Satélite', 'Sur'])
  })

  it('sends the body the API expects', async () => {
    const onSubmit = renderModal()
    await choose('Depósito de origen', /Central/)
    await choose('Depósito de destino', /Sur/)
    typeQuantity('30')
    submit()

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        stock_transfer: {
          product_id: 7,
          origin_warehouse_id: 1,
          destination_warehouse_id: 3,
          quantity: 30,
        },
      }),
    )
  })

  it('refuses more units than the origin holds', async () => {
    const onSubmit = renderModal()
    await choose('Depósito de origen', /Central/)
    await choose('Depósito de destino', /Sur/)
    typeQuantity('101')
    submit()

    expect(await screen.findByText('El origen tiene 100 unidades.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('refuses zero units', async () => {
    renderModal()
    await choose('Depósito de origen', /Central/)
    await choose('Depósito de destino', /Sur/)
    typeQuantity('0')
    submit()

    expect(await screen.findByText('La cantidad tiene que ser mayor a cero.')).toBeInTheDocument()
  })

  it('asks for both warehouses before sending', async () => {
    renderModal()
    typeQuantity('5')
    submit()

    expect(await screen.findByText('Elegí el depósito de origen.')).toBeInTheDocument()
    expect(screen.getByText('Elegí el depósito de destino.')).toBeInTheDocument()
  })

  it('shows the rejection of the API inside the modal', () => {
    renderModal({ error: 'El depósito de origen ya no tiene esas unidades.' })

    expect(screen.getByRole('alert')).toHaveTextContent('ya no tiene esas unidades')
  })
})
