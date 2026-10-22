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
  city: 'La Plata',
  province: 'Buenos Aires',
  storedUnits: 230,
  capacity: 5000,
}

const PROVINCES = ['Buenos Aires', 'Córdoba', 'Santa Fe']

function renderModal(warehouse?: Warehouse) {
  const onSubmit = vi.fn()
  renderWithTheme(
    <WarehouseFormModal
      open
      warehouse={warehouse}
      provinces={PROVINCES}
      onSubmit={onSubmit}
      onClose={vi.fn()}
    />,
  )
  return onSubmit
}

const field = (name: string) => screen.getByRole('textbox', { name: new RegExp(`^${name}`) })

function fill(name: string, value: string) {
  fireEvent.change(field(name), { target: { value } })
}

const provinceSelect = () => screen.getByRole('combobox', { name: /^Provincia/ })

async function chooseProvince(option: string) {
  fireEvent.mouseDown(provinceSelect())
  fireEvent.click(await screen.findByRole('option', { name: option }))
}

describe('WarehouseFormModal', () => {
  it('creates a warehouse with the three required fields', async () => {
    const onSubmit = renderModal()
    fill('Nombre', 'Depósito Sur')
    fill('Dirección', 'Av. Colón 789')
    fill('Código postal', 'B8000ABC')
    fireEvent.click(screen.getByRole('button', { name: 'Crear depósito' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          name: 'Depósito Sur',
          address: 'Av. Colón 789',
          zipCode: 'B8000ABC',
          city: '',
          province: '',
          capacity: '',
        },
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

  // TESIS-185: el courier pide la localidad y la provincia del origen.
  describe('the city and the province', () => {
    it('sends the city and the province the user chose', async () => {
      const onSubmit = renderModal()
      fill('Nombre', 'Depósito Sur')
      fill('Dirección', 'Av. Colón 789')
      fill('Código postal', 'B8000ABC')
      fill('Localidad', 'Córdoba')
      await chooseProvince('Córdoba')
      fireEvent.click(screen.getByRole('button', { name: 'Crear depósito' }))

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ city: 'Córdoba', province: 'Córdoba' }),
          expect.anything(),
        ),
      )
    })

    it('offers the provinces of the API plus none', () => {
      renderModal()
      fireEvent.mouseDown(provinceSelect())

      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
        'Sin provincia',
        ...PROVINCES,
      ])
    })

    it('opens the edition with the current city and province', () => {
      renderModal(CENTRAL)

      expect(field('Localidad')).toHaveValue('La Plata')
      expect(provinceSelect()).toHaveTextContent('Buenos Aires')
    })

    it('lets the user clear the province', async () => {
      const onSubmit = renderModal(CENTRAL)
      await chooseProvince('Sin provincia')
      fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ province: '' }),
          expect.anything(),
        ),
      )
    })
  })

  // TESIS-162: con la capacidad, el panel mide la ocupación del depósito.
  describe('the capacity', () => {
    it('opens the edition with the current capacity', () => {
      renderModal(CENTRAL)

      expect(field('Capacidad')).toHaveValue('5000')
    })

    it('leaves it empty for a warehouse that never declared one', () => {
      renderModal({ ...CENTRAL, capacity: null })

      expect(field('Capacidad')).toHaveValue('')
    })

    it('sends the capacity the user typed', async () => {
      const onSubmit = renderModal(CENTRAL)
      fill('Capacidad', '12000')
      fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ capacity: '12000' }),
          expect.anything(),
        ),
      )
    })

    // La API la pide mayor a cero: un depósito donde no entra nada no guarda nada.
    it('refuses zero, and says how to leave it undeclared', async () => {
      const onSubmit = renderModal(CENTRAL)
      fill('Capacidad', '0')
      fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      expect(
        await screen.findByText('Tiene que ser mayor a 0. Dejala vacía si no la sabés.'),
      ).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('refuses a fraction or a thousands separator', async () => {
      const onSubmit = renderModal(CENTRAL)
      fill('Capacidad', '1.500')
      fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      expect(
        await screen.findByText(
          'Ingresá una cantidad entera de unidades, sin puntos ni decimales.',
        ),
      ).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    // La columna es `integer`: más que eso reventaba al guardar.
    it('refuses a number the column cannot hold', async () => {
      const onSubmit = renderModal(CENTRAL)
      fill('Capacidad', '3000000000')
      fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      expect(
        await screen.findByText('Es más de lo que se puede guardar. Revisá el número.'),
      ).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
})
