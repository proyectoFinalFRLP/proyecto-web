import type { ReactNode } from 'react'

export interface LabeledFieldProps {
  label: string
  children: ReactNode
  /** Mensaje de error de validación; si falta, se muestra `helperText`. */
  error?: string
  helperText?: string
  /**
   * Marca el rótulo con el asterisco de obligatorio. Sólo lo dibuja: el
   * `required` del input lo sigue pasando quien lo monta, que es quien sabe si
   * el control lo acepta.
   */
  required?: boolean
  /** Ocupa la fila completa de la grilla. */
  fullWidth?: boolean
}
