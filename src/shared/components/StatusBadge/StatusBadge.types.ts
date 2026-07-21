import type { MouseEventHandler, ReactNode } from 'react'

// Estados semánticos del design system.
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

export type StatusBadgeSize = 'sm' | 'md' | 'lg'

export interface StatusBadgeProps {
  /** Estado semántico que define los colores. */
  status: StatusVariant
  /** Texto del badge (ej. "Entregado", "En tránsito"). */
  label: ReactNode
  /** Tamaño del badge. Por defecto `md`. */
  size?: StatusBadgeSize
  /** Ícono opcional a la izquierda del texto. */
  icon?: ReactNode
  /** Ícono opcional a la derecha (ej. un chevron para disparar un menú). */
  endIcon?: ReactNode
  /** Si se define, el badge se renderiza como botón clickeable (hover, focus, cursor). */
  onClick?: MouseEventHandler<HTMLElement>
  'aria-haspopup'?: boolean
  'aria-expanded'?: boolean
  'aria-controls'?: string
  id?: string
}
