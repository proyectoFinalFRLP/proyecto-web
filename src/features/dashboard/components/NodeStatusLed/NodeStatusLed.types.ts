import type { NodeSyncStatus } from '../../types'

export interface NodeStatusLedProps {
  /** Estado de frescura del nodo, ya derivado por `useInfraHealth`. */
  status: NodeSyncStatus
  /**
   * Texto del estado. Obligatorio a propósito: el DS prohíbe comunicar con
   * color solo, así que el LED siempre viaja con su etiqueta accesible.
   */
  label: string
}
