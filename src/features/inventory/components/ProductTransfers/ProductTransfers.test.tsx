import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type * as inventoryHooks from '../../hooks/useInventory'
import { useCreateTransfer, useProductTransfers, useSettleTransfer } from '../../hooks/useInventory'
import type { Product, StockTransfer, Warehouse } from '../../types'

import { ProductTransfers } from './ProductTransfers'

vi.mock('../../hooks/useInventory', async (importOriginal) => ({
  ...(await importOriginal<typeof inventoryHooks>()),
  useProductTransfers: vi.fn(),
  useCreateTransfer: vi.fn(),
  useSettleTransfer: vi.fn(),
}))

const CENTRAL: Warehouse = { id: 1, name: 'Central', address: 'Av. 7' }
const SUR: Warehouse = { id: 3, name: 'Sur', address: 'Av. Colón' }

const WAREHOUSES: Warehouse[] = [CENTRAL, SUR]

const PRODUCT: Product = {
  id: 7,
  sku: 'NOR-003',
  name: 'Mouse',
  description: null,
  category: null,
  weight: 0.1,
  dimensions: null,
  stocks: [{ warehouseId: 1, quantity: 100, warehouse: CENTRAL, stockStatus: 'low' }],
  totalStock: 100,
  stockStatus: 'low',
  inTransitQuantity: 4,
  inTransitByWarehouse: [{ warehouseId: 3, name: 'Sur', quantity: 4 }],
  updatedAt: '2026-09-01T10:00:00Z',
  version: null,
}

const TRANSFER: StockTransfer = {
  id: 55,
  quantity: 4,
  status: 'in_transit',
  dispatchedAt: '2026-09-30T10:00:00Z',
  origin: { id: 1, name: 'Central' },
  destination: { id: 3, name: 'Sur' },
}

const settle = vi.fn()

function listTransfers(data: StockTransfer[]) {
  vi.mocked(useProductTransfers).mockReturnValue({
    data,
    isPending: false,
    isError: false,
  } as never)
}

beforeEach(() => {
  settle.mockReset()
  listTransfers([TRANSFER])
  vi.mocked(useCreateTransfer).mockReturnValue({
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  } as never)
  vi.mocked(useSettleTransfer).mockReturnValue({ mutate: settle, isPending: false } as never)
})

const renderSection = (product: Product = PRODUCT, warehouses: Warehouse[] = WAREHOUSES) =>
  renderWithTheme(<ProductTransfers product={product} warehouses={warehouses} />)

const transferRow = () =>
  within(screen.getByRole('list', { name: 'Transferencias en curso' })).getByRole('listitem')

describe('ProductTransfers', () => {
  it('lists the transfers in flight with their route and units', () => {
    renderSection()

    expect(transferRow()).toHaveTextContent('Central → Sur')
    expect(transferRow()).toHaveTextContent('4 unidades')
  })

  it('says so when nothing is in flight', () => {
    listTransfers([])
    renderSection()

    expect(screen.getByText('No hay transferencias en curso para este producto.')).toBeVisible()
  })

  it('asks before receiving and then receives', () => {
    renderSection()

    fireEvent.click(within(transferRow()).getByRole('button', { name: 'Recibir' }))
    expect(screen.getByText('Se van a sumar 4 unidades al stock de Sur.')).toBeInTheDocument()
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Recibir' }),
    )

    expect(settle).toHaveBeenCalledWith({ id: 55, outcome: 'receive' }, expect.anything())
  })

  it('asks before cancelling, as a destructive action', () => {
    renderSection()

    fireEvent.click(within(transferRow()).getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar transferencia' }))

    expect(settle).toHaveBeenCalledWith({ id: 55, outcome: 'cancel' }, expect.anything())
  })

  it('opens the transfer form', () => {
    renderSection()

    fireEvent.click(screen.getByRole('button', { name: 'Transferir stock' }))

    expect(screen.getByRole('combobox', { name: 'Depósito de origen' })).toBeInTheDocument()
  })

  it('turns the transfer off when there is no other warehouse', () => {
    renderSection(PRODUCT, [CENTRAL])

    expect(screen.getByRole('button', { name: 'Transferir stock' })).toBeDisabled()
  })

  it('turns the transfer off when no warehouse holds units', () => {
    renderSection({ ...PRODUCT, stocks: [] })

    expect(screen.getByRole('button', { name: 'Transferir stock' })).toBeDisabled()
  })
})
