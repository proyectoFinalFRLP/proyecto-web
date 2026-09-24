import type { WarehouseShare } from '../../utils/capacity'

export interface WarehouseLoadCardProps {
  /** Depósitos ya ordenados y con su proporción, derivados por `warehouseShares`. */
  warehouses: WarehouseShare[]
  /** Unidades guardadas entre todos: el epígrafe de la cabecera. */
  storedUnits: number
  /** Muestra filas fantasma mientras llega la respuesta. */
  loading?: boolean
}
