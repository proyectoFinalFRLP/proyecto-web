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

  it('shows the note under the value', () => {
    renderWithTheme(<StatCard label="Unidades" value="67" note="3 líneas" />)

    expect(screen.getByText('3 líneas')).toBeInTheDocument()
  })

  it('renders no empty note when there is nothing to clarify', () => {
    const { container } = renderWithTheme(<StatCard label="Unidades" value="67" note="" />)

    expect(container.textContent).toBe('Unidades67')
  })

  describe('trend chip', () => {
    // El valor de la tarjeta llega en es-AR («124.592»); la tendencia se
    // formatea acá y tiene que hablar el mismo idioma, con el signo a la vista.
    it('formats the variation in the locale of the app, with its sign', () => {
      renderWithTheme(<StatCard label="Volumen" value="124.592" trend={{ value: 12.4 }} />)

      expect(screen.getByText('+12,4%')).toBeInTheDocument()
    })

    it('keeps the minus sign of a drop', () => {
      renderWithTheme(<StatCard label="Entregas" value="98,2%" trend={{ value: -0.4 }} />)

      expect(screen.getByText('-0,4%')).toBeInTheDocument()
    })

    it('shows no sign when nothing changed', () => {
      renderWithTheme(<StatCard label="Entregas" value="98,2%" trend={{ value: 0 }} />)

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('rounds to one decimal: the chip signals direction, not the exact figure', () => {
      renderWithTheme(<StatCard label="Volumen" value="1" trend={{ value: 3.14159 }} />)

      expect(screen.getByText('+3,1%')).toBeInTheDocument()
    })
  })

  it('shows the fixed tag with its icon when there is no trend', () => {
    renderWithTheme(
      <StatCard
        label="Anomalías activas"
        value="142"
        tag="Crítico"
        tagTone="error"
        tagIcon={<svg data-testid="tag-icon" />}
      />,
    )

    expect(screen.getByText('Crítico')).toBeInTheDocument()
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument()
  })
})
