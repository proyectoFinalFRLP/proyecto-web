import type { ReactNode } from 'react'

import type { EditLine } from '../../utils/edit'

export interface EditLinesTableProps {
  lines: EditLine[]
  /** Claves de las líneas que piden más de lo que su depósito tiene libre. */
  overStock: ReadonlySet<string>
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
