import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchShipmentCounts, fetchShipmentPage } from '../api'
import { shipmentKeys } from '../queryKeys'
import type { ShipmentCounts, ShipmentFilters, ShipmentPage, ShipmentStatus } from '../types'

/**
 * Las pestañas del listado, en el orden del ciclo de vida del envío, con el
 * estado que filtra cada una. El id es el que usa la respuesta de
 * `GET /shipments/counts`, así que la pantalla lee cada contador por nombre.
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
 * Los cinco contadores de las pestañas, en una sola consulta.
 *
 * Eran cinco requests, uno por pestaña, cada uno pidiendo una fila sólo para
 * leer su `meta.total`. El comentario que estaba acá decía que iban en paralelo
 * «porque la API de envíos no expone un endpoint de contadores» y que si las
 * pestañas crecieran convendría pedirlo: TESIS-165 lo agregó.
 *
 * Respetan la búsqueda: si no lo hicieran, buscar un seguimiento dejaría la
 * tabla con una fila y la pestaña diciendo «Todos (20)».
 *
 * Que falle no voltea la pantalla: la tabla se ve igual y las pestañas quedan
 * sin número. Antes podía fallar una sola y las otras cuatro seguían; ahora son
 * las cinco o ninguna, que es lo honesto —si la consulta no respondió, no se
 * sabe ningún contador— y es lo que ya hace el catálogo.
 *
 * `keepPreviousData` por el mismo motivo que el listado: el término entra en la
 * clave, así que cada letra tipeada estrena consulta y sin esto las cinco
 * pestañas se quedarían sin número en cada pulsación.
 */
export function useShipmentCounts(search = '') {
  return useQuery<ShipmentCounts>({
    queryKey: shipmentKeys.tabCounts(search),
    queryFn: () => fetchShipmentCounts(search),
    placeholderData: keepPreviousData,
  })
}
