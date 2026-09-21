import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import { SAMPLE_OVERVIEW } from '../../sampleData'

import { AnomaliesTable } from './AnomaliesTable'

describe('AnomaliesTable', () => {
  it('shows one row per anomaly with the five columns of the design', () => {
    renderWithTheme(<AnomaliesTable anomalies={SAMPLE_OVERVIEW.anomalies} />)

    const table = screen.getByRole('table', { name: 'Anomalías regionales recientes' })
    const [, ...rows] = within(table).getAllByRole('row')
    expect(rows).toHaveLength(3)

    const first = rows[0]
    expect(within(first).getByText('#INC-8892')).toBeInTheDocument()
    expect(within(first).getByText('CD Ezeiza')).toBeInTheDocument()
    expect(within(first).getByText('BUE-4')).toBeInTheDocument()
    expect(within(first).getByText('Demora por clima')).toBeInTheDocument()
    expect(within(first).getByText('4.200 u')).toBeInTheDocument()
    expect(within(first).getByText('En análisis')).toBeInTheDocument()
  })

  it('labels each status with the vocabulary of the design', () => {
    renderWithTheme(<AnomaliesTable anomalies={SAMPLE_OVERVIEW.anomalies} />)

    expect(screen.getByText('En análisis')).toBeInTheDocument()
    expect(screen.getByText('Crítico')).toBeInTheDocument()
    expect(screen.getByText('Resuelto')).toBeInTheDocument()
  })

  // No hay bitácora a la que llevar: la acción se ve, pero no promete nada.
  it('keeps the log action visible but disabled', () => {
    renderWithTheme(<AnomaliesTable anomalies={SAMPLE_OVERVIEW.anomalies} />)

    expect(screen.getByRole('button', { name: 'Ver bitácora completa' })).toBeDisabled()
  })

  it('says so when the period has no anomalies', () => {
    renderWithTheme(<AnomaliesTable anomalies={[]} />)

    expect(screen.getByText('No hay anomalías registradas en el período.')).toBeInTheDocument()
  })
})
