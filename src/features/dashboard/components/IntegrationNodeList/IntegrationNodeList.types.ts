import type { InfraNode } from '../../hooks/useInfraHealth'

export interface IntegrationNodeListProps {
  /** Nodos ya filtrados (configurados y activos) y derivados por `useInfraHealth`. */
  nodes: InfraNode[]
  /** Nodos que traen marca de sync — denominador del contador de la cabecera. */
  reportingNodes: number
  onlineNodes: number
  /** Muestra filas fantasma mientras llega la respuesta. */
  loading?: boolean
}
