import type { InfraNode } from '../../hooks/useInfraHealth'

export interface IntegrationNodeListProps {
  /** Nodos ya filtrados (configurados y activos) y derivados por `useInfraHealth`. */
  nodes: InfraNode[]
  /** Muestra filas fantasma mientras llega la respuesta. */
  loading?: boolean
}
