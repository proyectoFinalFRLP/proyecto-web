export interface CategoryFieldProps {
  /** Valor actual (`''` = sin categoría). Controlado por el formulario. */
  value: string
  onChange: (value: string) => void
  /** El vocabulario de la API. */
  categories: string[]
  label: string
  helperText?: string
  /** Rótulo de la opción vacía. */
  noneLabel: string
}
