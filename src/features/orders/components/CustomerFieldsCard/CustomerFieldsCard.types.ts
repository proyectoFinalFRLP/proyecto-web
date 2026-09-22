import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import type { CustomerFormData } from './CustomerFieldsCard.schema'

export interface CustomerFieldsCardProps {
  /** El formulario lo posee la página: acá sólo se pintan sus campos. */
  register: UseFormRegister<CustomerFormData>
  errors: FieldErrors<CustomerFormData>
}
