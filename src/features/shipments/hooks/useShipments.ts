import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'

import { fetchShipmentCount, fetchShipmentPage } from '../api'
import { shipmentKeys } from '../queryKeys'
import type { ShipmentFilters, ShipmentPage, ShipmentStatus } from '../types'

/**
 * Las pestañas del listado, en el orden del ciclo de vida del envío, con el
 * estado que filtra cada una. Una sola lista y no dos arrays paralelos: los
 * contadores se piden en este mismo orden y se leen por índice.
 */
export const SHIPMENT_TABS = [
  { id: 'all', status: undefined },
  { id: 'pending', status: 'pending' },
  { id: 'ready_to_ship', status: 'ready_to_ship' },
  { id: 'in_transit', status: 'in_transit' },
  { id: 'delivered', status: 'delivered' },
] as const satisfies readonly { id: string; status: ShipmentStatus | undefined }[]

export type ShipmentTabId = (typeof SHIPMENT_TABS)[number]['id']

/**
 * Una página del listado.
 *
 * `keepPreviousData` es lo que evita que cambiar de página vacíe la tabla: sin
 * esto el cuerpo queda en blanco hasta que responde la API y la pantalla salta
 * de alto en cada click.
 */
export function useShipmentPage(filters: ShipmentFilters) {
  return useQuery<ShipmentPage>({
    queryKey: shipmentKeys.list(filters),
    queryFn: () => fetchShipmentPage(filters),
    placeholderData: keepPreviousData,
  })
}

/**
 * Los cinco contadores de las pestañas, en paralelo. Son consultas de una sola
 * fila que leen nada más que el `meta.total`.
 *
 * Van en paralelo y no en una respuesta como los del catálogo (TESIS-162)
 * porque la API de envíos no expone un endpoint de contadores: agregarlo es
 * trabajo de backend y esta pantalla no lo necesita para existir. Si la
 * cantidad de pestañas creciera, ahí sí convendría pedirlo.
 *
 * Que uno falle no voltea la pantalla: la tabla se ve igual y esa pestaña queda
 * sin número.
 */
export function useShipmentCounts() {
  return useQueries({
    queries: SHIPMENT_TABS.map(({ status }) => ({
      queryKey: shipmentKeys.count(status),
      queryFn: () => fetchShipmentCount(status),
    })),
    combine: (results) => results.map((result) => result.data),
  })
}
