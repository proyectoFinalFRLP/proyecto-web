import type { ReactNode } from 'react'
import type { StatusVariant } from 'shared/components'

export interface StatCardProps {
  /** Etiqueta de la métrica (ej. "Órdenes pendientes"). */
  label: string
  /** Valor ya calculado de la métrica. */
  value: number | string
  /** Ícono opcional a la derecha del label. */
  icon?: ReactNode
  /** Color semántico del ícono y del acento. Por defecto `info`. */
  tone?: StatusVariant
  /** Texto auxiliar debajo del valor (ej. "sobre 128 órdenes"). */
  caption?: string
  /** Muestra un skeleton en lugar del valor mientras llegan los datos. */
  loading?: boolean
}
