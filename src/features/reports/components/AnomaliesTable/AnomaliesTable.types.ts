import type { ShipmentAnomaly } from '../../types'

export interface AnomaliesTableProps {
  /** Los envíos demorados del reporte. Vacío es «ninguno», y la tabla lo dice. */
  anomalies: ShipmentAnomaly[]
}
