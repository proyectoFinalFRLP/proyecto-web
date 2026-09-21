import { useQuery } from '@tanstack/react-query'

import { fetchReportsOverview } from '../api'
import { reportKeys } from '../queryKeys'
import type { ReportPeriod, ReportsOverview } from '../types'

/**
 * Los agregados de la pantalla de reportes para un período.
 *
 * Es una sola consulta y no una por bloque: el endpoint de agregados, cuando
 * exista, va a calcular todo sobre la misma ventana de tiempo, y pedirlo junto
 * es lo que garantiza que las cuatro tarjetas, la curva y la tabla hablen del
 * mismo período. El período entra en la key, así cambiarlo refetchea solo.
 */
export function useReportsOverview(period: ReportPeriod) {
  return useQuery<ReportsOverview>({
    queryKey: reportKeys.overview(period),
    queryFn: () => fetchReportsOverview(period),
  })
}
