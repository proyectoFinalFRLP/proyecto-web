import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { Warehouse } from '../../types'

import { WarehouseFormModal } from './WarehouseFormModal'

const CENTRAL: Warehouse = {
  id: 1,
  name: 'Depósito Central',
  address: 'Av. 7 N° 1234',
  zipCode: '1900',
  storedUnits: 230,
}

function renderModal(warehouse?: Warehouse) {
  const onSubmit = vi.fn()
  renderWithTheme(
    <WarehouseFormModal open warehouse={warehouse} onSubmit={onSubmit} onClose={vi.fn()} />,
  )
  return onSubmit
}

const field = (name: string) => screen.getByRole('textbox', { name: new RegExp(`^${name}`) })

function fill(name: string, value: string) {
  fireEvent.change(field(name), { target: { value } })
}

describe('WarehouseFormModal', () => {
  it('creates a warehouse with the three fields', async () => {
    const onSubmit = renderModal()
    fill('Nombre', 'Depósito Sur')
    fill('Dirección', 'Av. Colón 789')
    fill('Código postal', 'B8000ABC')
    fireEvent.click(screen.getByRole('button', { name: 'Crear depósito' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { name: 'Depósito Sur', address: 'Av. Colón 789', zipCode: 'B8000ABC' },
        expect.anything(),
      ),
    )
  })

  it('opens the edition with the current data', () => {
    renderModal(CENTRAL)

    expect(screen.getByText('Editar depósito: Depósito Central')).toBeInTheDocument()
    expect(field('Código postal')).toHaveValue('1900')
  })

  it('asks for every field before sending', async () => {
    const onSubmit = renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Crear depósito' }))

    expect(await screen.findByText('Ingresá el nombre del depósito.')).toBeInTheDocument()
    expect(screen.getByText('Ingresá la dirección.')).toBeInTheDocument()
    expect(screen.getByText('Ingresá el código postal.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // De este número sale la cotización de cada envío que sale del depósito.
  it('refuses a postal code that is not Argentine', async () => {
    const onSubmit = renderModal(CENTRAL)
    fill('Código postal', '190')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(
      await screen.findByText('Usá 4 dígitos (1900) o el CPA completo (B1900ABC).'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
