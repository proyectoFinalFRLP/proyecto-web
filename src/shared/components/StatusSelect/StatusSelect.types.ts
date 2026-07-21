import type { StatusBadgeSize, StatusVariant } from '../StatusBadge'

export interface StatusOption {
  status: StatusVariant
  label: string
}

export interface StatusSelectProps {
  /** Opciones de estado a elegir. */
  options: StatusOption[]
  /** Estado seleccionado (controlado). */
  value: StatusVariant
  /** Callback al elegir un estado. */
  onChange: (status: StatusVariant) => void
  /** Tamaño del badge disparador. Por defecto `md`. */
  size?: StatusBadgeSize
}
