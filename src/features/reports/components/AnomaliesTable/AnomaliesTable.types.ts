import type { RegionalAnomaly } from '../../types'

export interface AnomaliesTableProps {
  /** `null` cuando el sistema no registra anomalías: la tabla lo dice, vacía. */
  anomalies: RegionalAnomaly[] | null
}
