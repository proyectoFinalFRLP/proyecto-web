export interface WizardNextButtonProps {
  /** El rótulo del botón: «Siguiente: destino y origen». */
  label: string
  /**
   * Lo que le falta al paso para avanzar, ya en palabras y en el orden de la
   * pantalla («el DNI / CUIT», «el depósito de origen»). Vacío cuando no falta
   * nada.
   */
  gaps: string[]
  disabled: boolean
  onClick: () => void
}
