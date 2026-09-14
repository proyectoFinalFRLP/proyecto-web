import type { ReactNode } from 'react'

/** Una cubeta del desglose: ícono, rótulo y cantidad. */
export interface StockBucket {
  id: string
  label: string
  icon: ReactNode
  /** Cantidad ya formateada, o la marca de "sin dato". */
  value: string
  /** El dato no está disponible todavía: la fila se atenúa. */
  unknown?: boolean
  /** Cubeta destacada del diseño (borde punteado + color de acción). */
  accent?: boolean
}

export interface MasterStockCardProps {
  /** Unidades en depósito, ya formateadas. */
  totalLabel: string
  /** Epígrafe bajo el total (en cuántos depósitos está repartido). */
  caption: string
  buckets: StockBucket[]
  /** Aclaración del desglose que la API todavía no expone. */
  footnote?: string
  onEditStock: () => void
}
