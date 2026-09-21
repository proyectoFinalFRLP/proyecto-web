import type { RecentOrder } from '../../types'

export interface RecentOrdersTableProps {
  /** Las últimas órdenes, ya en el orden que devolvió la API. */
  orders: RecentOrder[]
  /** Mientras la consulta viaja, el vacío dice "cargando" y no "no hay órdenes". */
  loading?: boolean
}
