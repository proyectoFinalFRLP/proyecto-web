import { useQuery } from '@tanstack/react-query'

import { activityKeys, fetchActivity } from '../api/activity'
import type { ActivityEntry } from '../api/activity'

/**
 * La actividad reciente de la empresa, para el panel de la campanita
 * (TESIS-163).
 *
 * `enabled` llega desde afuera: el panel se monta cerrado en todas las
 * pantallas, y pedir el feed en cada visita para algo que nadie abrió sería un
 * request por pantalla. Se pide al abrirlo y queda en caché.
 */
export function useActivity(enabled: boolean) {
  return useQuery<ActivityEntry[]>({
    queryKey: activityKeys.list(),
    queryFn: fetchActivity,
    enabled,
  })
}
