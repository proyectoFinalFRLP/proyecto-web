import type { ReactNode } from 'react'
import type { OrderDraftItem } from 'shared/store'

export interface DraftItemsTableProps {
  items: OrderDraftItem[]
  onQuantityChange: (productId: number, quantity: number) => void
  onRemove: (productId: number) => void
  /** El buscador para sumar un SKU; va en la barra de la tabla, como «Agregar SKU» en S05. */
  toolbar?: ReactNode
}

export interface QuantityCellProps {
  item: OrderDraftItem
  onChange: (quantity: number) => void
}
