import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  // Regla del design system: nunca color solo. El texto es lo que hace legible
  // el estado para quien no distingue los tonos.
  it('always shows the label, which is what carries the meaning', () => {
    renderWithTheme(<StatusBadge status="success" label="Entregado" />)

    expect(screen.getByText('Entregado')).toBeInTheDocument()
  })

  it('is not a button when there is nothing to click', () => {
    renderWithTheme(<StatusBadge status="warning" label="En tránsito" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('becomes a button when it receives onClick', async () => {
    const onClick = vi.fn()
    renderWithTheme(<StatusBadge status="info" label="Pendiente" onClick={onClick} />)

    const badge = screen.getByRole('button', { name: 'Pendiente' })
    badge.click()

    expect(onClick).toHaveBeenCalledOnce()
  })

  // Se renderiza como <button type="button">: sin el type explícito, dentro de
  // un formulario dispararía el submit al hacer clic.
  it('does not submit the form it may live in', () => {
    renderWithTheme(<StatusBadge status="error" label="Fallido" onClick={vi.fn()} />)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('forwards the menu attributes it is given', () => {
    renderWithTheme(
      <StatusBadge
        status="neutral"
        label="Borrador"
        onClick={vi.fn()}
        aria-haspopup
        aria-controls="status-menu"
      />,
    )

    const badge = screen.getByRole('button')
    expect(badge).toHaveAttribute('aria-haspopup', 'true')
    expect(badge).toHaveAttribute('aria-controls', 'status-menu')
  })

  it('renders the icons around the label', () => {
    renderWithTheme(
      <StatusBadge
        status="success"
        label="Entregado"
        icon={<span data-testid="leading" />}
        endIcon={<span data-testid="trailing" />}
      />,
    )

    expect(screen.getByTestId('leading')).toBeInTheDocument()
    expect(screen.getByTestId('trailing')).toBeInTheDocument()
  })

  // El texto del badge va en `onContainer` en los dos modos (TESIS-91): en
  // oscuro iba en `main`, que sobre una fila crítica no llegaba al contraste AA.
  // La variable es la misma; lo que cambia entre modos es su valor, y eso es lo
  // que se verifica: el valor que resuelve el esquema activo en el propio badge
  // (`textD` en oscuro, `textL` en claro).
  it('paints the label with the on-container tone of each theme mode', () => {
    const resolved: Record<string, string> = {}

    for (const mode of ['dark', 'light'] as const) {
      const view = renderWithTheme(<StatusBadge status="error" label="Sin stock" />, { mode })
      const style = getComputedStyle(view.getByText('Sin stock'))

      expect(style.color.toLowerCase()).toBe('var(--mui-palette-error-oncontainer)')
      resolved[mode] = style
        .getPropertyValue('--mui-palette-error-onContainer')
        .trim()
        .toLowerCase()
      view.unmount()
    }

    expect(resolved).toEqual({ dark: '#fecdd3', light: '#9f1239' })
  })
})
