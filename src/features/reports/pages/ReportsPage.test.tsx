import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { downloadCsv } from 'shared/utils'
import type * as sharedUtils from 'shared/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { useReportsOverview } from '../hooks/useReportsOverview'
import { SAMPLE_OVERVIEW } from '../sampleData'

import { ReportsPage } from './ReportsPage'

vi.mock('../hooks/useReportsOverview', () => ({
  useReportsOverview: vi.fn(),
}))

// La descarga en sí tiene sus pruebas en `shared/utils/csv.test.ts`: acá
// importa qué se manda a descargar.
vi.mock('shared/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof sharedUtils>()),
  downloadCsv: vi.fn(),
}))

// Los enlaces de la tabla de anomalías necesitan un router.
function renderPage() {
  renderWithTheme(
    <MemoryRouter>
      <ReportsPage />
    </MemoryRouter>,
  )
}

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
    vi.mocked(downloadCsv).mockClear()
  })

  it('shows a spinner while the aggregates travel', () => {
    useReportsOverviewMock.mockReturnValue(query({ isPending: true }))

    renderPage()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Reportes' })).not.toBeInTheDocument()
  })

  it('shows its own error copy with a retry, never the raw API message', () => {
    useReportsOverviewMock.mockReturnValue(query({ isError: true }))

    renderPage()

    expect(screen.getByText('No pudimos cargar los reportes.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('renders the seven blocks of the design once the data is there', () => {
    useReportsOverviewMock.mockReturnValue(query({ data: SAMPLE_OVERVIEW }))

    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Reportes' })).toBeInTheDocument()
    expect(screen.getByText('Volumen despachado')).toBeInTheDocument()
    // «Facturación» también es una opción del segmentado: la tarjeta se busca
    // por su valor.
    expect(screen.getByText('$4,2 MM')).toBeInTheDocument()
    expect(screen.getByText('Cumplimiento de entregas')).toBeInTheDocument()
    expect(screen.getByText('Anomalías activas')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Curva de ventas' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Entregas por operador' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Anomalías recientes' })).toBeInTheDocument()
  })

  // Los números salen de la API: el distintivo de muestra ya no existe.
  it('does not flag the numbers as sample data', () => {
    useReportsOverviewMock.mockReturnValue(query({ data: SAMPLE_OVERVIEW }))

    renderPage()

    expect(screen.queryByText('Datos de muestra')).not.toBeInTheDocument()
  })

  // Sin entregas con fecha comprometida no hay cumplimiento que medir; sin
  // envíos demorados, la tabla lo dice. Ninguno de los dos es un dato faltante.
  it('explains an on time rate with nothing to measure and an empty anomalies table', () => {
    useReportsOverviewMock.mockReturnValue(
      query({
        data: {
          ...SAMPLE_OVERVIEW,
          kpis: {
            ...SAMPLE_OVERVIEW.kpis,
            onTimeDeliveryRate: null,
            activeAnomalies: { count: 0, critical: false },
          },
          anomalies: [],
        },
      }),
    )

    renderPage()

    expect(
      screen.getByText('Ninguna entrega del período tenía fecha comprometida.'),
    ).toBeInTheDocument()
    expect(screen.getByText('No hay envíos demorados en el período.')).toBeInTheDocument()
    expect(screen.queryByText(/el modelo no guarda/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/todavía no registra anomalías/i)).not.toBeInTheDocument()
  })

  it('asks for the last 30 days by default and refetches when the period changes', () => {
    useReportsOverviewMock.mockReturnValue(query({ data: SAMPLE_OVERVIEW }))

    renderPage()

    expect(useReportsOverviewMock).toHaveBeenLastCalledWith('30d')

    fireEvent.click(screen.getByRole('button', { name: /período del reporte/i }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Últimos 7 días' }))

    expect(useReportsOverviewMock).toHaveBeenLastCalledWith('7d')
    expect(screen.getByRole('button', { name: /últimos 7 días/i })).toBeInTheDocument()
  })

  // El CSV se arma con lo que la pantalla ya tiene, para el período elegido.
  it('downloads the report of the period on screen', () => {
    useReportsOverviewMock.mockReturnValue(query({ data: SAMPLE_OVERVIEW }))

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Exportar reporte' }))

    expect(downloadCsv).toHaveBeenCalledTimes(1)
    const [filename, rows] = vi.mocked(downloadCsv).mock.calls[0]
    expect(filename).toBe('reporte-30d-2026-10-04.csv')
    expect(rows).toContainEqual(['Período', 'Últimos 30 días'])
  })
})
