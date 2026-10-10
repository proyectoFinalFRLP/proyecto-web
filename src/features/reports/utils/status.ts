import type { DataTableRowTone, StatusVariant } from 'shared/components'

import { reportsCopy } from '../content'
import type { AnomalyStatus } from '../types'

// Traducción de los estados del dominio a lo que la pantalla muestra. Mapas
// explícitos y no `switch` con default: si el backend suma un estado, el
// compilador marca este archivo en vez de pintarlo en gris sin avisar.

const ANOMALY_VARIANTS: Record<AnomalyStatus, StatusVariant> = {
  investigating: 'warning',
  critical: 'error',
  resolved: 'success',
}

const ANOMALY_LABELS: Record<AnomalyStatus, string> = {
  investigating: reportsCopy.anomalies.status.investigating,
  critical: reportsCopy.anomalies.status.critical,
  resolved: reportsCopy.anomalies.status.resolved,
}

export function anomalyStatusVariant(status: AnomalyStatus): StatusVariant {
  return ANOMALY_VARIANTS[status]
}

export function anomalyStatusLabel(status: AnomalyStatus): string {
  return ANOMALY_LABELS[status]
}

/**
 * Énfasis de la fila. Sólo la anomalía crítica se resalta, como en el diseño:
 * es la que pide atención en una tabla que se barre de un vistazo. Atenuar la
 * resuelta la escondería, y sigue siendo información del período.
 */
export function anomalyRowTone(status: AnomalyStatus): DataTableRowTone {
  return status === 'critical' ? 'critical' : 'default'
}
