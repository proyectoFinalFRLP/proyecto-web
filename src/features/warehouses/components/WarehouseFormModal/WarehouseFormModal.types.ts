import type { Warehouse, WarehouseInput } from '../../types'

export interface WarehouseFormModalProps {
  open: boolean
  /** El depósito a editar; sin él, el modal es de alta. */
  warehouse?: Warehouse
  submitting?: boolean
  /** Rechazo de la API, ya traducido. Se muestra dentro del modal. */
  error?: string
  /** Las provincias del select (`Order::PROVINCES`), leídas de la API. */
  provinces: string[]
  provincesLoading?: boolean
  provincesError?: boolean
  onSubmit: (input: WarehouseInput) => void
  onClose: () => void
}
