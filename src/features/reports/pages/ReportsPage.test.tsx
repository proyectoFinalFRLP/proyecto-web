import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { useReportsOverview } from '../hooks/useReportsOverview'
import { SAMPLE_OVERVIEW } from '../sampleData'

import { ReportsPage } from './ReportsPage'

vi.mock('../hooks/useReportsOverview', () => ({
  useReportsOverview: vi.fn(),
}))

const useReportsOverviewMock = vi.mocked(useReportsOverview)

// Sólo los campos que la página lee de la query.
function query(state: { data?: typeof SAMPLE_OVERVIEW; isPending?: boolean; isError?: boolean }) {
  return {
    data: state.data,
    isPending: state.isPending ?? false,
    isError: state.isError ?? false,
    refetch: vi.fn(),
  } as never
}

describe('ReportsPage', () => {
  beforeEach(() => {
    useReportsOverviewMock.mockReset()
  })

  it('shows a spinner while the aggregates travel', () => {
    useReportsOverviewMock.mockReturnValue(query({ isPending: true }))

    renderWithTheme(<ReportsPage />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Reportes' })).not.toBeInTheDocument()
  })

  it('shows its own error copy with a retry, never the raw API message', () => {
    useReportsOverviewMock.mockReturnValue(query({ isError: true }))

    renderWithTheme(<ReportsPage />)

    expect(screen.getByText('No pudimos cargar los reportes.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('renders the seven blocks of the design once the data is there', () => {
    useReportsOverviewMock.mockReturnValue(query({ data: SAMPLE_OVERVIEW }))

    renderWithTheme(<ReportsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Reportes' })).toBeInTheDocument()
    expect(screen.getByText('Volumen despachado')).toBeInTheDocument()
    // «Facturación» también es una opción del segmentado: la tarjeta se busca
    // por su valor.
    expect(screen.getByText('$4,2 MM')).toBeInTheDocument()
    expect(screen.getByText('Cumplimiento de entregas')).toBeInTheDocument()
    expect(screen.getByText('Anomalías activas')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Curva de despacho' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Entregas por operador' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Anomalías recientes' })).toBeInTheDocument()
  })

  // Los números salen de la API: el distintivo de muestra ya no corresponde.
  it('no longer flags the numbers as sample data', () => {
    useReportsOverviewMock.mockReturnValue(query({ data: SAMPLE_OVERVIEW }))

    renderWithTheme(<ReportsPage />)

    expect(screen.queryByText('Datos de muestra')).not.toBeInTheDocument()
  })

  // Lo que el modelo no puede calcular llega en `null`: la tarjeta queda y lo
  // dice, en vez de un número inventado o un cero que se leería como dato.
  it('shows without value and explains what the model cannot compute', () => {
    useReportsOverviewMock.mockReturnValue(
      query({
        data: {
          ...SAMPLE_OVERVIEW,
          kpis: { ...SAMPLE_OVERVIEW.kpis, onTimeDeliveryRate: null, activeAnomalies: null },
          anomalies: null,
        },
      }),
    )

    renderWithTheme(<ReportsPage />)

    expect(screen.getByText(/Requiere la fecha de entrega comprometida/)).toBeInTheDocument()
    expect(screen.getByText('El sistema todavía no registra anomalías.')).toBeInTheDocument()
    expect(screen.getByText(/esta tabla se completa cuando exista ese dato/)).toBeInTheDocument()
  })

  it('asks for the last 30 days by default and refetches when the period changes', () => {
    useReportsOverviewMock.mockReturnValue(query({ data: SAMPLE_OVERVIEW }))

    renderWithTheme(<ReportsPage />)

    expect(useReportsOverviewMock).toHaveBeenLastCalledWith('30d')

    fireEvent.click(screen.getByRole('button', { name: /período del reporte/i }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Últimos 7 días' }))

    expect(useReportsOverviewMock).toHaveBeenLastCalledWith('7d')
    expect(screen.getByRole('button', { name: /últimos 7 días/i })).toBeInTheDocument()
  })

  // No hay endpoint de exportación: la acción se ve, pero no promete nada.
  it('keeps the export action visible but disabled', () => {
    useReportsOverviewMock.mockReturnValue(query({ data: SAMPLE_OVERVIEW }))

    renderWithTheme(<ReportsPage />)

    expect(screen.getByRole('button', { name: 'Exportar reporte' })).toBeDisabled()
  })
})
