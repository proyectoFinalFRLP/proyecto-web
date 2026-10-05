import { Box, Stack } from '@mui/material'
import { useState } from 'react'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'

import { AnomaliesTable } from '../components/AnomaliesTable'
import { DispatchCurveCard } from '../components/DispatchCurveCard'
import { ReportMetrics } from '../components/ReportMetrics'
import { ReportsHeader } from '../components/ReportsHeader'
import { ServiceLevelCard } from '../components/ServiceLevelCard'
import { reportsCopy } from '../content'
import { useReportsOverview } from '../hooks/useReportsOverview'
import type { ReportPeriod } from '../types'

// La ventana con la que abre el diseño («Últimos 30 días»).
const DEFAULT_PERIOD: ReportPeriod = '30d'

// Ancho de la columna lateral de S14 (nivel de servicio), en px.
const SIDE_COLUMN_WIDTH = 320

/**
 * Reportes — analítica de la operación (S14, TESIS-64): métricas del período,
 * curva de despacho, nivel de servicio por operador y anomalías recientes.
 *
 * Los agregados salen de una sola consulta por período (`useReportsOverview`)
 * contra `GET /reports/overview`. Lo que el modelo no puede calcular
 * —cumplimiento de plazo, anomalías— se muestra sin dato y dice por qué.
 */
export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD)
  const overview = useReportsOverview(period)

  if (overview.isPending) return <LoadingSpinner fullScreen />
  // `onRetry` y no un recargar de página: React Query ya tiene la consulta
  // cacheada con su período, así que reintentar es volver a dispararla.
  if (overview.isError) {
    return (
      <ErrorFallback
        error={new Error(reportsCopy.page.error)}
        onRetry={() => void overview.refetch()}
      />
    )
  }

  const { kpis, granularity, curve, carriers, anomalies } = overview.data

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <ReportsHeader period={period} onPeriodChange={setPeriod} />

        <ReportMetrics kpis={kpis} />

        {/* La curva toma el ancho sobrante y las entregas por operador su columna
            fija, como en el diseño; en pantallas angostas se apilan. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: `minmax(0, 1fr) ${SIDE_COLUMN_WIDTH}px` },
            gap: 3,
          }}
        >
          <DispatchCurveCard points={curve} granularity={granularity} />
          <ServiceLevelCard carriers={carriers} />
        </Box>

        <AnomaliesTable anomalies={anomalies} />
      </Stack>
    </PageWrapper>
  )
}
