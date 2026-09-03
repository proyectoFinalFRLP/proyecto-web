import type { NodeSyncStatus } from '../../types'

export interface NodeStatusIconProps {
  /** Estado de frescura del nodo, ya derivado por `useInfraHealth`. */
  status: NodeSyncStatus
  /**
   * Texto del estado. Obligatorio a propósito: el ícono nunca comunica solo con
   * color, y además es lo único que lee un lector de pantalla en esta columna.
   */
  label: string
}
