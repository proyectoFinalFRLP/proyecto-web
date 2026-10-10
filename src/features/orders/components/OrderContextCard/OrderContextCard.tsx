import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import { MenuItem, TextField } from '@mui/material'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { LabeledField } from 'shared/components'

import { ordersCopy } from '../../content'
import { statusLabel } from '../../utils/status'
import { FormFieldsGrid, FormSection } from '../FormSection'

import type { OrderContextFormData } from './OrderContextCard.schema'

const { context: copy } = ordersCopy.edit

const EDITABLE_STATUSES = ['pending', 'paid'] as const

// El documento va en la monoespaciada del DS: es un identificador.
const MONO_INPUT = { input: { sx: { typography: 'dataMono' } } }

export interface OrderContextCardProps {
  register: UseFormRegister<OrderContextFormData>
  control: Control<OrderContextFormData>
  errors: FieldErrors<OrderContextFormData>
  readOnly: boolean
}

/**
 * Cliente, documento y estado de la orden en S09. El estado es un select de dos
 * opciones y el cambio se ve en el acto en el badge del encabezado, que es el
 * «Lifecycle Status» que pide la card.
 *
 * Presentacional: la página es dueña del formulario (React Hook Form).
 *
 * Cliente y documento llevan la marca de obligatorio, como en el alta: el
 * domicilio de esta misma pantalla la lleva desde TESIS-173 (es el mismo
 * `DestinationFieldsCard`), y con la mitad de los campos marcados la otra mitad
 * parecía opcional. Una orden que ya no se edita no marca nada.
 */
export function OrderContextCard({ register, control, errors, readOnly }: OrderContextCardProps) {
  const required = !readOnly

  return (
    <FormSection icon={<BadgeOutlinedIcon aria-hidden />} title={copy.title}>
      <FormFieldsGrid>
        <LabeledField
          label={copy.fields.customerName}
          error={errors.customerName?.message}
          required={required}
        >
          <TextField
            {...register('customerName')}
            required={required}
            error={errors.customerName !== undefined}
            disabled={readOnly}
            fullWidth
          />
        </LabeledField>

        <LabeledField
          label={copy.fields.customerDocument}
          error={errors.customerDocument?.message}
          required={required}
        >
          <TextField
            {...register('customerDocument')}
            required={required}
            error={errors.customerDocument !== undefined}
            disabled={readOnly}
            slotProps={MONO_INPUT}
            fullWidth
          />
        </LabeledField>

        <LabeledField label={copy.fields.status}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                disabled={readOnly}
                fullWidth
                // El `<label>` de LabeledField no nombra al combobox del Select
                // de MUI: mismo arreglo que la provincia del domicilio.
                slotProps={{ select: { SelectDisplayProps: { 'aria-label': copy.fields.status } } }}
              >
                {EDITABLE_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {statusLabel(status)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </LabeledField>
      </FormFieldsGrid>
    </FormSection>
  )
}
