import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'

import type { DestinationFormData } from './DestinationFieldsCard.schema'

export interface DestinationFieldsCardProps {
  /** El formulario lo posee la página: acá sólo se pintan sus campos. */
  register: UseFormRegister<DestinationFormData>
  /** El select de provincia es controlado: `register` no alcanza para el Select de MUI. */
  control: Control<DestinationFormData>
  errors: FieldErrors<DestinationFormData>
  provinces: string[]
  provincesLoading: boolean
  provincesError: boolean
  /** Todos los campos de sólo lectura: la modificación de una orden que ya no se puede editar. */
  readOnly?: boolean
  /**
   * El domicilio deja de ser obligatorio: la venta se retira en el local, así
   * que no va a ningún lado. Se siguen mostrando los campos porque el domicilio
   * del cliente puede hacer falta para la factura.
   */
  optional?: boolean
}
