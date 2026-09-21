import type { ReportPeriod } from '../../types'

export interface ReportsHeaderProps {
  period: ReportPeriod
  onPeriodChange: (period: ReportPeriod) => void
  /** Muestra el distintivo de «Datos de muestra» junto al título. */
  sampleData?: boolean
}

export interface PeriodSelectProps {
  value: ReportPeriod
  onChange: (period: ReportPeriod) => void
}
