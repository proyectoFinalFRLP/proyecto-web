import type { ReactNode } from 'react'

import type { EditLine, StockShortfall } from '../../utils/edit'

export interface EditLinesTableProps {
  lines: EditLine[]
  /**
   * Los grupos de producto y depósito que no entran en el stock libre. El aviso
   * es del grupo; en rojo van sólo las líneas que aumentaron (`lineKeys`).
   */
  shortfalls: StockShortfall[]
  /** El nombre del depósito de una línea, para la columna y el aviso de stock. */
  warehouseName: (warehouseId: number) => string
  onQuantityChange: (key: string, quantity: number) => void
  onRemove: (key: string) => void
  /** Todo el formulario queda de sólo lectura: la orden no se puede modificar. */
  readOnly: boolean
  /** La barra para sumar una línea nueva, como «Agregar línea» en S09. */
  toolbar?: ReactNode
}

export interface QuantityStepperProps {
  line: EditLine
  invalid: boolean
  disabled: boolean
  onChange: (quantity: number) => void
}
