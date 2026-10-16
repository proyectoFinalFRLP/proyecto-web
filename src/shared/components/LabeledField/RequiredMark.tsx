import { labeledFieldContent } from './content'
import { RequiredMarkRoot } from './LabeledField.styles'

/**
 * El asterisco de «obligatorio», para un rótulo que no es el de un campo: el
 * título de una sección que hay que completar, como el depósito de origen del
 * alta manual (TESIS-173).
 *
 * `aria-hidden` para que no ensucie el nombre accesible del campo ni del
 * título: «DNI / CUIT», no «DNI / CUIT asterisco». La obligatoriedad le llega
 * al lector de pantalla por `required` / `aria-required`, no por el dibujo.
 */
export function RequiredMark() {
  return <RequiredMarkRoot aria-hidden>{labeledFieldContent.requiredMark}</RequiredMarkRoot>
}
