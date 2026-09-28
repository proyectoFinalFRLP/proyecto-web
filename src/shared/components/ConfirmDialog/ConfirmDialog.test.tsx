import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { ConfirmDialog } from './ConfirmDialog'
import type { ConfirmDialogProps } from './ConfirmDialog.types'

function renderDialog(overrides: Partial<ConfirmDialogProps> = {}) {
  const props: ConfirmDialogProps = {
    open: true,
    title: '¿Eliminar la orden?',
    description: 'Se va a eliminar la orden #ORD-1042.',
    confirmLabel: 'Eliminar',
    cancelLabel: 'Cancelar',
    closeLabel: 'Cerrar',
    onConfirm: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }

  renderWithTheme(<ConfirmDialog {...props} />)

  return props
}

describe('ConfirmDialog', () => {
  it('stays closed until it is opened', () => {
    renderDialog({ open: false })

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  // Un lector de pantalla anuncia título y descripción al abrir: la persona
  // tiene que saber qué está confirmando sin recorrer el diálogo.
  it('announces itself with its title and description', () => {
    renderDialog()

    const dialog = screen.getByRole('alertdialog', { name: '¿Eliminar la orden?' })

    expect(dialog).toHaveAccessibleDescription('Se va a eliminar la orden #ORD-1042.')
  })

  it('confirms only when the person asks for it', () => {
    const { onConfirm, onClose } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes from cancel, from the header and with Escape', () => {
    const { onConfirm, onClose } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(3)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('does not let anything fire while the action is in flight', () => {
    const { onConfirm, onClose } = renderDialog({ busy: true })

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('leaves only the way out when confirming is no longer possible', () => {
    renderDialog({ canConfirm: false })

    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('shows the extra content below the description', () => {
    renderDialog({ children: <p>La orden ya fue despachada.</p> })

    expect(screen.getByText('La orden ya fue despachada.')).toBeInTheDocument()
  })

  it('is as wide as a question unless asked for more room', () => {
    renderDialog()

    expect(screen.getByRole('alertdialog')).toHaveStyle({ maxWidth: '480px' })
  })

  // En una destructiva un Enter apurado no tiene que poder borrar nada.
  it('starts a destructive confirmation focused on cancel', () => {
    renderDialog({ tone: 'destructive' })

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
  })
})
