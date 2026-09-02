import { useCallback, useMemo } from 'react'
import type { StatusVariant } from 'shared/components'

import type { IntegrationNode, NodeSyncStatus, ServiceType } from '../types'

import { useIntegrations } from './useIntegrations'
import { useNow } from './useNow'

// Ventana de frescura: una sync más vieja que esto se considera fuera de los
// parámetros normales de latencia y prende el LED en rojo.
//
// El valor es provisorio: la card no fija un umbral y el worker de sync
// (TESIS-35) todavía no define su cadencia. Cuando exista, este número tiene que
// pasar a ser ~2x el intervalo del worker.
export const SYNC_STALE_THRESHOLD_MS = 15 * 60 * 1000

// Cada cuánto avanza el reloj del widget. 30s alcanza: los tiempos se muestran
// con granularidad de minuto.
const CLOCK_INTERVAL_MS = 30 * 1000

// Cortes de salud para el color del KPI. Por encima de `healthy` está todo bien;
// entre medio hay nodos caídos pero el sistema opera; por debajo es incidente.
const HEALTH_THRESHOLD = { healthy: 90, degraded: 50 }

export interface InfraNode {
  serviceId: number
  name: string
  type: ServiceType
  status: NodeSyncStatus
  /** ISO de la última sync exitosa, o `null` si el backend todavía no la manda. */
  lastSyncedAt: string | null
}

export interface InfraHealth {
  /** Solo los nodos con integración configurada y activa, ordenados por nombre. */
  nodes: InfraNode[]
  activeNodes: number
  /** Nodos activos que sí traen una marca de sync válida (denominador del KPI). */
  reportingNodes: number
  onlineNodes: number
  /** Porcentaje 0-100, o `null` si ningún nodo reporta sync todavía. */
  healthPercentage: number | null
  healthTone: StatusVariant
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

// `last_synced_at` puede no venir (contrato actual), venir `null` (nunca
// sincronizó) o traer una fecha inválida. Los tres casos son `unknown`: no
// sabemos el estado del nodo y no lo damos por sano.
function resolveStatus(lastSyncedAt: string | null, now: number): NodeSyncStatus {
  if (!lastSyncedAt) return 'unknown'

  const syncedAt = new Date(lastSyncedAt).getTime()
  if (Number.isNaN(syncedAt)) return 'unknown'

  return now - syncedAt <= SYNC_STALE_THRESHOLD_MS ? 'online' : 'stale'
}

function toNode(integration: IntegrationNode, now: number): InfraNode {
  const lastSyncedAt = integration.last_synced_at ?? null

  return {
    serviceId: integration.service_id,
    name: integration.service_name,
    type: integration.type,
    status: resolveStatus(lastSyncedAt, now),
    lastSyncedAt,
  }
}

function resolveTone(healthPercentage: number | null): StatusVariant {
  if (healthPercentage === null) return 'neutral'
  if (healthPercentage >= HEALTH_THRESHOLD.healthy) return 'success'
  if (healthPercentage >= HEALTH_THRESHOLD.degraded) return 'warning'
  return 'error'
}

// Deriva los nodos y el KPI de salud de la lista que ya trajo React Query: es una
// proyección memoizada sobre `data`, sin estado duplicado ni fetch extra. La
// dependencia de `now` es lo que hace que un nodo pase a `stale` con el paso del
// tiempo, sin necesidad de refetch.
export function useInfraHealth(): InfraHealth {
  const { data, isLoading, isError, error, refetch } = useIntegrations()
  const now = useNow(CLOCK_INTERVAL_MS)

  // Envuelto: `refetch` de React Query recibe `RefetchOptions`, y cablearlo
  // directo a un `onClick` le pasaría el MouseEvent como opciones.
  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  const nodes = useMemo(
    () =>
      (data ?? [])
        // El filtro que pide la card: solo services con integración existente y
        // activa. Los demás son servicios disponibles, no nodos de la empresa.
        .filter((integration) => integration.configured && integration.is_active)
        .map((integration) => toNode(integration, now))
        .sort((a, b) => a.name.localeCompare(b.name, 'es-AR')),
    [data, now],
  )

  const counts = useMemo(() => {
    const online = nodes.filter((node) => node.status === 'online').length
    const reporting = nodes.filter((node) => node.status !== 'unknown').length

    return { online, reporting }
  }, [nodes])

  // Denominador = nodos que reportan, no todos los activos. Mientras el backend
  // no mande la marca de sync, `reporting` es 0 y el KPI queda en `null` ("—"):
  // preferimos no saber antes que mostrar 0% (falsa caída total) o 100% (falsa
  // salud) sobre un dato que no existe.
  const healthPercentage =
    counts.reporting === 0 ? null : Math.round((counts.online / counts.reporting) * 100)

  return {
    nodes,
    activeNodes: nodes.length,
    reportingNodes: counts.reporting,
    onlineNodes: counts.online,
    healthPercentage,
    healthTone: resolveTone(healthPercentage),
    isLoading,
    isError,
    error,
    refetch: retry,
  }
}
