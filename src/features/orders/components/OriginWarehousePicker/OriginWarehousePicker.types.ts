import type { OriginWarehouse } from '../../types'
import type { WarehouseCoverage } from '../../utils/shipping'

export interface OriginWarehousePickerProps {
  warehouses: OriginWarehouse[]
  /** Cobertura del borrador en cada depósito, por id. Ausente mientras carga el stock. */
  coverage: Map<number, WarehouseCoverage> | null
  selectedId: number | null
  onSelect: (warehouse: OriginWarehouse) => void
}
