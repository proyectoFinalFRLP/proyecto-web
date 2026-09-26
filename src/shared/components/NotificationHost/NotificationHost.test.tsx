import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { notify, useNotificationStore } from '../../store/notificationStore'

import { NotificationHost } from './NotificationHost'

afterEach(() => {
  act(() => useNotificationStore.setState({ notifications: [] }))
})

describe('NotificationHost', () => {
  it('renders nothing while there is nothing to say', () => {
    renderWithTheme(<NotificationHost />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a notification pushed from outside React', () => {
    renderWithTheme(<NotificationHost />)

    act(() => notify('Producto guardado.', 'success'))

    expect(screen.getByRole('alert')).toHaveTextContent('Producto guardado.')
  })

  // Con un tema de dos esquemas, un hex horneado no repinta al cambiar de modo
  // (TESIS-104): el fondo opaco del toast sale de la variable del esquema activo.
  it('paints the toast from the color scheme variables', () => {
    renderWithTheme(<NotificationHost />)

    act(() => notify('Producto guardado.', 'success'))

    expect(getComputedStyle(screen.getByRole('alert')).backgroundColor).toBe(
      'var(--mui-palette-background-paper)',
    )
  })

  // Apiladas se tapan entre sí y ninguna se lee: la segunda espera su turno.
  it('shows one notification at a time, in order', () => {
    renderWithTheme(<NotificationHost />)

    act(() => {
      notify('Primera.')
      notify('Segunda.')
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Primera.')
    expect(screen.queryByText('Segunda.')).not.toBeInTheDocument()
  })

  // Un clic en cualquier otro lado no es "ya lo leí": el toast se va por
  // tiempo o por su X, no porque la persona siguió trabajando.
  it('stays up when the person clicks elsewhere on the page', async () => {
    renderWithTheme(<NotificationHost />)

    act(() => notify('Producto guardado.', 'success'))
    // El Snackbar arma su escucha de clics afuera en el tick siguiente.
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    fireEvent.click(document.body)

    expect(screen.getByRole('alert')).toHaveTextContent('Producto guardado.')
  })

  it('moves on to the next one when the current is closed', () => {
    renderWithTheme(<NotificationHost />)

    act(() => {
      notify('Primera.')
      notify('Segunda.')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Segunda.')
  })
})
