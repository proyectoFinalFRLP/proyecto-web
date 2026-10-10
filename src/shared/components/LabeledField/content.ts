// Copy centralizado del LabeledField — sin literales sueltos en el JSX
// (docs/guidelines/component-structure.md §4).
export const labeledFieldContent = {
  /**
   * La marca de campo obligatorio. Es sólo visual: lo que el lector de
   * pantalla anuncia es el `required` del input, que quien monta el campo
   * le pasa junto con el de acá.
   */
  requiredMark: '*',
} as const
