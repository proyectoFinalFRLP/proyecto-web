import type { ReportPeriod } from '../../types'

export interface ReportsHeaderProps {
  period: ReportPeriod
  onPeriodChange: (period: ReportPeriod) => void
  /** «Exportar reporte»: baja el CSV del período que se está viendo. */
  onExport: () => void
}

export interface PeriodSelectProps {
  value: ReportPeriod
  onChange: (period: ReportPeriod) => void
}
