import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import { SAMPLE_OVERVIEW } from '../../sampleData'
import type { ReportsKpis } from '../../types'

import { ReportMetrics } from './ReportMetrics'

const KPIS = SAMPLE_OVERVIEW.kpis

describe('ReportMetrics', () => {
  it('shows the four metrics of the design, formatted for es-AR', () => {
    renderWithTheme(<ReportMetrics kpis={KPIS} />)

    expect(screen.getByText('124.592')).toBeInTheDocument()
    expect(screen.getByText('$4,2 MM')).toBeInTheDocument()
    expect(screen.getByText('98,2%')).toBeInTheDocument()
    expect(screen.getByText('142')).toBeInTheDocument()
  })

  it('shows each variation with its sign', () => {
    renderWithTheme(<ReportMetrics kpis={KPIS} />)

    expect(screen.getByText('+12,4%')).toBeInTheDocument()
    expect(screen.getByText('+8,1%')).toBeInTheDocument()
    expect(screen.getByText('-0,4%')).toBeInTheDocument()
  })

  it('flags the anomalies as critical when the period has one', () => {
    renderWithTheme(<ReportMetrics kpis={KPIS} />)

    expect(screen.getByText('Crítico')).toBeInTheDocument()
  })

  it('drops the critical chip when no anomaly is critical', () => {
    const kpis: ReportsKpis = { ...KPIS, activeAnomalies: { count: 3, critical: false } }

    renderWithTheme(<ReportMetrics kpis={kpis} />)

    expect(screen.queryByText('Crítico')).not.toBeInTheDocument()
  })

  // Sin período anterior no hay con qué comparar: un «0%» se leería como
  // «igual que antes».
  it('shows no variation when there is no previous period', () => {
    const kpis: ReportsKpis = {
      ...KPIS,
      dispatchedUnits: { value: 10, trend: null },
      revenue: { value: 10, trend: null },
      onTimeDeliveryRate: { value: 10, trend: null },
    }

    renderWithTheme(<ReportMetrics kpis={kpis} />)

    // Un chip de tendencia siempre arranca con su signo.
    expect(screen.queryByText(/^[+-]\d/)).not.toBeInTheDocument()
  })
})
