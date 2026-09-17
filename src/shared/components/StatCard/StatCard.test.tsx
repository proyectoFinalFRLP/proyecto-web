import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('shows the value it receives, already formatted', () => {
    renderWithTheme(<StatCard label="Órdenes pendientes" value="3.092" />)

    expect(screen.getByText('Órdenes pendientes')).toBeInTheDocument()
    expect(screen.getByText('3.092')).toBeInTheDocument()
  })

  describe('while loading', () => {
    // El valor que llega en ese estado es un placeholder del caller: mostrarlo
    // sería afirmar un número que todavía no se pidió.
    it('hides the value and announces itself as busy', () => {
      const { container } = renderWithTheme(
        <StatCard label="Órdenes pendientes" value="—" loading />,
      )

      expect(screen.queryByText('—')).not.toBeInTheDocument()
      expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
    })

    // El label sigue visible: es lo que le dice al usuario qué está cargando.
    it('keeps the label so the card is still identifiable', () => {
      renderWithTheme(<StatCard label="Envíos activos" value="—" loading />)

      expect(screen.getByText('Envíos activos')).toBeInTheDocument()
    })
  })

  it('is not busy once the value is there', () => {
    const { container } = renderWithTheme(<StatCard label="Envíos activos" value="1.284" />)

    expect(container.firstChild).toHaveAttribute('aria-busy', 'false')
  })
})
