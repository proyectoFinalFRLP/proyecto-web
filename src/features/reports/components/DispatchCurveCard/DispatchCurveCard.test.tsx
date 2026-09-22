import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import { SAMPLE_OVERVIEW } from '../../sampleData'

import { DispatchCurveCard } from './DispatchCurveCard'

describe('DispatchCurveCard', () => {
  it('opens on the orders series, with its axis in units', () => {
    renderWithTheme(<DispatchCurveCard points={SAMPLE_OVERVIEW.curve} />)

    expect(screen.getByRole('button', { name: 'Órdenes', pressed: true })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Curva de despacho: órdenes por día' })).toBeVisible()
    expect(screen.getByText('10k')).toBeInTheDocument()
  })

  it('switches to revenue and reformats the axis in pesos', () => {
    renderWithTheme(<DispatchCurveCard points={SAMPLE_OVERVIEW.curve} />)

    fireEvent.click(screen.getByRole('button', { name: 'Facturación' }))

    expect(screen.getByRole('button', { name: 'Facturación', pressed: true })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Curva de despacho: facturación por día' }),
    ).toBeVisible()
    expect(screen.getByText('$1 MM')).toBeInTheDocument()
    expect(screen.queryByText('10k')).not.toBeInTheDocument()
  })

  // El segmentado es exclusivo: soltar la opción activa no deja la curva sin serie.
  it('keeps the current series when its option is clicked again', () => {
    renderWithTheme(<DispatchCurveCard points={SAMPLE_OVERVIEW.curve} />)

    fireEvent.click(screen.getByRole('button', { name: 'Órdenes' }))

    expect(screen.getByRole('button', { name: 'Órdenes', pressed: true })).toBeInTheDocument()
  })

  it('draws one path for the line and one for the area', () => {
    const { container } = renderWithTheme(<DispatchCurveCard points={SAMPLE_OVERVIEW.curve} />)

    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(2)
    paths.forEach((path) => expect(path.getAttribute('d')).not.toBe(''))
  })
})
