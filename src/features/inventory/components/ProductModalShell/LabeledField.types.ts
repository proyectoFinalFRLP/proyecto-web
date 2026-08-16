import type { ReactNode } from 'react'

export interface LabeledFieldProps {
  label: string
  children: ReactNode
  /** Mensaje de error de validación; si falta, se muestra `helperText`. */
  error?: string
  helperText?: string
  /** Ocupa la fila completa de la grilla. */
  fullWidth?: boolean
}
