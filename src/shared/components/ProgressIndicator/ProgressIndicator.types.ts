export type ProgressTone = 'primary' | 'success' | 'warning' | 'error' | 'neutral'

/** `thin` 4px · `medium` 8px · `large` 16px (filas con label al costado). */
export type ProgressSize = 'thin' | 'medium' | 'large'

export type ProgressLayout = 'stacked' | 'inline'

export interface ProgressIndicatorProps {
  /** 0-100. Se clampea al rango: de acá sale el ancho de la barra. */
  value?: number
  tone?: ProgressTone
  size?: ProgressSize
  label?: string
  /**
   * Nombre accesible cuando el rótulo visible no lo aporta `label` (ej. el
   * epígrafe vive fuera del componente). Por defecto usa `label`.
   */
  ariaLabel?: string
  /** Muestra el porcentaje junto al label. */
  showValue?: boolean
  /** Progreso desconocido: anima e ignora `value`. */
  indeterminate?: boolean
  /** `stacked`: label arriba de la barra. `inline`: label · barra · valor. */
  layout?: ProgressLayout
  /** Ancho de la columna del label en `inline` (px), para alinear varias filas. */
  labelWidth?: number
}

export interface StepsProgressProps {
  /** Cantidad de pasos del proceso. */
  total: number
  /** Pasos ya completados. Se clampea a `0..total`. */
  completed: number
  tone?: ProgressTone
  label?: string
  /** Nombre accesible cuando el rótulo visible no lo aporta `label`. */
  ariaLabel?: string
  /** Texto de apoyo debajo de los pasos (ej. el nombre de la etapa actual). */
  caption?: string
}

export interface ProgressSkeletonProps {
  label?: string
  /** Círculo a la izquierda, para filas con avatar o ícono. */
  avatar?: boolean
  /** Cantidad de líneas de texto simuladas. */
  lines?: number
}
