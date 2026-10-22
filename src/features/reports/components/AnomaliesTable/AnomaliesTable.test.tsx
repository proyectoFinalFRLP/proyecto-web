import { fireEvent, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import { SAMPLE_OVERVIEW } from '../../sampleData'
import type { ShipmentAnomaly } from '../../types'

import { AnomaliesTable } from './AnomaliesTable'

/** Dónde quedó parada la navegación, para afirmar a dónde lleva un enlace. */
function Location() {
  const location = useLocation()
  return <p>{`${location.pathname}${location.search}`}</p>
}

function renderTable(anomalies: ShipmentAnomaly[] = SAMPLE_OVERVIEW.anomalies) {
  renderWithTheme(
    <MemoryRouter initialEntries={['/reports']}>
      <Routes>
        <Route path="/reports" element={<AnomaliesTable anomalies={anomalies} />} />
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>,
  )
}

function rows() {
  const table = screen.getByRole('table', { name: 'Envíos demorados recientes' })
  const [, ...body] = within(table).getAllByRole('row')
  return body
}

describe('AnomaliesTable', () => {
  it('shows one row per delayed shipment with its order, origin, courier and delay', () => {
    renderTable()

    expect(rows()).toHaveLength(3)
    const first = rows()[0]
    expect(within(first).getByText('#40')).toBeInTheDocument()
    expect(within(first).getByText('CD Ezeiza')).toBeInTheDocument()
    expect(within(first).getByText('Andreani')).toBeInTheDocument()
    expect(within(first).getByText('1 oct')).toBeInTheDocument()
    expect(within(first).getByText('3 días de demora')).toBeInTheDocument()
    expect(within(first).getByText('4.200 u')).toBeInTheDocument()
    expect(within(first).getByText('Crítico')).toBeInTheDocument()
  })

  // La misma venta con el mismo número que en el resto de las pantallas.
  it('names the order as every other screen does', () => {
    renderTable()

    expect(within(rows()[1]).getByText('#1001')).toBeInTheDocument()
    expect(within(rows()[2]).getByText('#ML-2001')).toBeInTheDocument()
  })

  it('says one day in singular', () => {
    renderTable()

    expect(within(rows()[1]).getByText('1 día de demora')).toBeInTheDocument()
  })

  // Un envío anterior a que se guardara el origen no lo «perdió»: no lo tiene.
  it('marks what the shipment does not record instead of leaving the cell empty', () => {
    renderTable()

    expect(within(rows()[2]).getAllByText('—')).toHaveLength(2)
  })

  it('labels each status with the vocabulary of the design', () => {
    renderTable()

    expect(screen.getByText('En análisis')).toBeInTheDocument()
    expect(screen.getByText('Crítico')).toBeInTheDocument()
    expect(screen.getByText('Resuelto')).toBeInTheDocument()
  })

  it('takes the order to its detail', () => {
    renderTable()

    fireEvent.click(screen.getByRole('link', { name: '#40' }))

    expect(screen.getByText('/orders/40')).toBeInTheDocument()
  })

  // La bitácora completa es el listado de envíos filtrado por los demorados.
  it('takes the log action to the delayed shipments', () => {
    renderTable()

    fireEvent.click(screen.getByRole('link', { name: 'Ver bitácora completa' }))

    expect(screen.getByText('/shipments?delayed=true')).toBeInTheDocument()
  })

  it('says so when the period has no delayed shipments', () => {
    renderTable([])

    expect(screen.getByText('No hay envíos demorados en el período.')).toBeInTheDocument()
  })
})
