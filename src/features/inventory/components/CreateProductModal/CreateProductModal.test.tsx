import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { Warehouse } from '../../types'

import { CreateProductModal } from './CreateProductModal'

const CENTRAL: Warehouse = { id: 1, name: 'Depósito Central', address: 'Av. 7', capacity: null }

function renderModal() {
  const onSubmit = vi.fn()
  renderWithTheme(
    <CreateProductModal open warehouses={[CENTRAL]} onSubmit={onSubmit} onClose={vi.fn()} />,
  )
  return onSubmit
}

const measure = (name: string) => screen.getByRole('textbox', { name })

async function fillRequired() {
  fireEvent.change(screen.getByPlaceholderText('ej. Servomotor industrial Z5'), {
    target: { value: 'Mouse inalámbrico' },
  })
  fireEvent.change(screen.getByPlaceholderText('SKU-XXXX-XXX'), { target: { value: 'MOU-001' } })
  // El segundo select es el depósito de la primera fila; el primero, la categoría.
  fireEvent.mouseDown(screen.getAllByRole('combobox')[1])
  fireEvent.click(await screen.findByRole('option', { name: 'Depósito Central' }))
}

async function submittedProduct(onSubmit: ReturnType<typeof vi.fn>) {
  fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }))
  await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  return (onSubmit.mock.calls[0]?.[0] as { product: Record<string, unknown> }).product
}

// TESIS-185: tres medidas en centímetros, cada una opcional.
describe('CreateProductModal · the measurements', () => {
  it('names each of the three inputs', () => {
    renderModal()

    expect(measure('Largo (cm)')).toHaveValue('')
    expect(measure('Ancho (cm)')).toHaveValue('')
    expect(measure('Alto (cm)')).toHaveValue('')
  })

  it('creates a product without measurements', async () => {
    const onSubmit = renderModal()
    await fillRequired()

    expect(await submittedProduct(onSubmit)).toMatchObject({
      length_cm: null,
      width_cm: null,
      height_cm: null,
    })
  })

  it('sends the measurements the user typed, decimals included', async () => {
    const onSubmit = renderModal()
    await fillRequired()
    fireEvent.change(measure('Largo (cm)'), { target: { value: '16.5' } })
    fireEvent.change(measure('Ancho (cm)'), { target: { value: '7.8' } })
    fireEvent.change(measure('Alto (cm)'), { target: { value: '0.9' } })

    const product = await submittedProduct(onSubmit)
    expect(product).toMatchObject({ length_cm: 16.5, width_cm: 7.8, height_cm: 0.9 })
    expect(product).not.toHaveProperty('dimensions')
  })

  it('takes a comma as the decimal mark', async () => {
    const onSubmit = renderModal()
    await fillRequired()
    fireEvent.change(measure('Largo (cm)'), { target: { value: '16,5' } })

    expect(await submittedProduct(onSubmit)).toMatchObject({ length_cm: 16.5 })
  })

  // Con `type="number"`, «16-» llegaba vacío y se creaba sin la medida.
  it('says a measure it cannot read is wrong instead of dropping it', async () => {
    const onSubmit = renderModal()
    await fillRequired()
    fireEvent.change(measure('Alto (cm)'), { target: { value: '16-' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('Ingresá un número')).toBeVisible()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not take a negative measurement', async () => {
    const onSubmit = renderModal()
    await fillRequired()
    fireEvent.change(measure('Alto (cm)'), { target: { value: '-2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('Tiene que ser mayor a 0')).toBeVisible()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('CreateProductModal', () => {
  // TESIS-182: el alta arranca con el mismo mínimo que pone la API por defecto,
  // así un producto que nadie configuró se comporta como hasta ahora.
  it('starts the low stock threshold at the default of the API', () => {
    renderModal()

    expect(screen.getByRole('spinbutton', { name: /^Stock mínimo/ })).toHaveValue(100)
  })

  it('explains what the threshold means', () => {
    renderModal()

    expect(
      screen.getByText('Con este total o menos, el producto figura con stock bajo.'),
    ).toBeInTheDocument()
  })
})

describe('CreateProductModal · the free texts', () => {
  const field = (name: string) => screen.getByRole('textbox', { name })

  // Antes la descripción viajaba siempre en `null`: el alta no tenía el campo.
  it('sends the description, packaging and technical standard the user typed', async () => {
    const onSubmit = renderModal()
    await fillRequired()
    fireEvent.change(field('Descripción (opcional)'), { target: { value: 'Mouse de 3 botones' } })
    fireEvent.change(field('Empaque (opcional)'), { target: { value: 'Caja x 1' } })
    fireEvent.change(field('Norma técnica (opcional)'), { target: { value: 'IEC 60950' } })

    expect(await submittedProduct(onSubmit)).toMatchObject({
      description: 'Mouse de 3 botones',
      packaging: 'Caja x 1',
      technical_standard: 'IEC 60950',
    })
  })

  it('creates a product without them', async () => {
    const onSubmit = renderModal()
    await fillRequired()

    expect(await submittedProduct(onSubmit)).toMatchObject({
      description: null,
      packaging: null,
      technical_standard: null,
    })
  })
})
