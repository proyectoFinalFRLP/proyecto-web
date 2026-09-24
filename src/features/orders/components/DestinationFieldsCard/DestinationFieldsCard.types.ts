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
}
