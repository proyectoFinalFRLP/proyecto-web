import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import type * as warehouseHooks from '../hooks/useWarehouses'
import {
  useCreateWarehouse,
  useDeleteWarehouse,
  useUpdateWarehouse,
  useWarehouseList,
} from '../hooks/useWarehouses'
import type { Warehouse } from '../types'

import { WarehousesPage } from './WarehousesPage'

vi.mock('../hooks/useWarehouses', async (importOriginal) => ({
  ...(await importOriginal<typeof warehouseHooks>()),
  useWarehouseList: vi.fn(),
  useCreateWarehouse: vi.fn(),
  useUpdateWarehouse: vi.fn(),
  useDeleteWarehouse: vi.fn(),
}))

const WAREHOUSES: Warehouse[] = [
  { id: 1, name: 'Depósito Central', address: 'Av. 7 N° 1234', zipCode: '1900', storedUnits: 1230 },
  { id: 2, name: 'Depósito Satélite', address: 'Calle 25 N° 456', zipCode: '1602', storedUnits: 0 },
]

function idleMutation(overrides: object = {}) {
  return {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.mocked(useWarehouseList).mockReturnValue({
    data: WAREHOUSES,
    isPending: false,
    isError: false,
  } as never)
  vi.mocked(useCreateWarehouse).mockReturnValue(idleMutation() as never)
  vi.mocked(useUpdateWarehouse).mockReturnValue(idleMutation() as never)
  vi.mocked(useDeleteWarehouse).mockReturnValue(idleMutation() as never)
})

const row = (name: string) => {
  const cell = screen.getByText(name)
  const tableRow = cell.closest('tr')
  if (tableRow === null) throw new Error(`no row for ${name}`)
  return within(tableRow)
}

function openRowAction(name: string, action: string) {
  fireEvent.click(row(name).getByRole('button', { name: `Acciones del depósito ${name}` }))
  fireEvent.click(screen.getByRole('menuitem', { name: action }))
}

describe('WarehousesPage', () => {
  it('lists the warehouses with their address, postal code and units', () => {
    renderWithTheme(<WarehousesPage />)

    expect(row('Depósito Central').getByText('Av. 7 N° 1234')).toBeInTheDocument()
    expect(row('Depósito Central').getByText('1900')).toBeInTheDocument()
    expect(row('Depósito Central').getByText('1.230')).toBeInTheDocument()
  })

  it('opens the creation form', () => {
    renderWithTheme(<WarehousesPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo depósito' }))

    expect(screen.getByRole('button', { name: 'Crear depósito' })).toBeInTheDocument()
  })

  it('opens the edition of a row with its data', () => {
    renderWithTheme(<WarehousesPage />)

    openRowAction('Depósito Satélite', 'Editar')

    expect(screen.getByText('Editar depósito: Depósito Satélite')).toBeInTheDocument()
  })

  it('asks before deleting and then deletes', () => {
    const mutate = vi.fn()
    vi.mocked(useDeleteWarehouse).mockReturnValue(idleMutation({ mutate }) as never)
    renderWithTheme(<WarehousesPage />)

    openRowAction('Depósito Satélite', 'Eliminar')
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Eliminar' }),
    )

    expect(mutate).toHaveBeenCalledWith(2, expect.anything())
  })

  // El 409 dice por qué y la confirmación desaparece: reintentar falla igual.
  it('explains why the API refused the deletion and stops offering it', () => {
    vi.mocked(useDeleteWarehouse).mockReturnValue(
      idleMutation({
        isError: true,
        error: { status: 409, message: 'Cannot delete warehouse with existing stock' },
      }) as never,
    )
    renderWithTheme(<WarehousesPage />)

    openRowAction('Depósito Central', 'Eliminar')
    const dialog = within(screen.getByRole('alertdialog'))

    expect(dialog.getByText(/hay productos asignados a este depósito/)).toBeInTheDocument()
    expect(dialog.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
  })

  it('says so when the company has no warehouses yet', () => {
    vi.mocked(useWarehouseList).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as never)
    renderWithTheme(<WarehousesPage />)

    expect(screen.getByText(/Todavía no hay depósitos/)).toBeInTheDocument()
  })
})
