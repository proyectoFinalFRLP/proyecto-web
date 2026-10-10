import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import { SAMPLE_OVERVIEW } from '../../sampleData'
import type { CurvePoint } from '../../types'

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

  describe('X axis labels', () => {
    // El período de 30 días: un rótulo «dd/mm» por día.
    const month: CurvePoint[] = Array.from({ length: 30 }, (_, index) => ({
      label: `${String(index + 1).padStart(2, '0')}/09`,
      orders: 100 + index,
      revenue: 10_000 + index,
    }))

    /** Hace que el layout le dé ese ancho a todo, como haría el navegador. */
    function layoutWidth(width: number) {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        width,
      } as DOMRect)
    }

    // 30 rótulos de 48px no entran en 300px: entran 6, uno cada 5 días.
    it('shows one label every few days when they do not fit', () => {
      layoutWidth(300)
      renderWithTheme(<DispatchCurveCard points={month} />)

      expect(screen.getByText('01/09')).toBeInTheDocument()
      expect(screen.queryByText('02/09')).not.toBeInTheDocument()
      expect(screen.getByText('06/09')).toBeInTheDocument()
      expect(screen.getByText('26/09')).toBeInTheDocument()
      expect(screen.queryByText('30/09')).not.toBeInTheDocument()
    })

    it('shows every label when they fit', () => {
      layoutWidth(1600)
      renderWithTheme(<DispatchCurveCard points={month} />)

      expect(screen.getByText('02/09')).toBeInTheDocument()
      expect(screen.getByText('30/09')).toBeInTheDocument()
    })

    // Cada rótulo cae debajo de su punto, con las puntas ancladas a los bordes
    // para no salirse del lienzo.
    it('places each label under its point', () => {
      renderWithTheme(<DispatchCurveCard points={SAMPLE_OVERVIEW.curve} />)

      const labels = SAMPLE_OVERVIEW.curve.map((point) => screen.getByText(point.label))
      expect(labels[0]).toHaveStyle({ left: '0%', transform: 'none' })
      expect(labels[labels.length - 1]).toHaveStyle({
        left: '100%',
        transform: 'translateX(-100%)',
      })
      expect(labels[1]).toHaveStyle({ transform: 'translateX(-50%)' })
    })
  })
})
