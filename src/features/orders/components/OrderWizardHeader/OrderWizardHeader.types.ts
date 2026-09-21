export interface OrderWizardHeaderProps {
  /** Paso actual, base 1. */
  step: number
  /** Cuántos pasos tiene el asistente. */
  total: number
  /** Nombre de la etapa, al lado del título ("Cliente y productos"). */
  subtitle: string
}
