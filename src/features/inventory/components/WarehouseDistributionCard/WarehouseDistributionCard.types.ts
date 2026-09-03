import type { StatusVariant } from 'shared/components'

/** Una posición de stock del producto, ya formateada para la tabla. */
export interface WarehouseDistributionRow {
  id: number
  /** Nombre del depósito (ej. "CD Ezeiza"). */
  name: string
  /** Segunda línea con la ubicación, tal como la devuelve la API. */
  location: string
  /** Cantidades ya formateadas, o la marca de "sin dato". */
  committed: string
  inTransit: string
  onHand: string
  statusLabel: string
  statusVariant: StatusVariant
  /** Resalta la fila, como la posición crítica del diseño. */
  critical?: boolean
}

export interface WarehouseDistributionCardProps {
  rows: WarehouseDistributionRow[]
  /** Aclaración al pie sobre las columnas que la API todavía no expone. */
  footnote?: string
}
