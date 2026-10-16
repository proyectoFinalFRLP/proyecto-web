import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import { TextField } from '@mui/material'
import { LabeledField } from 'shared/components'

import { ordersCopy } from '../../content'
import { FormFieldsGrid, FormSection } from '../FormSection'

import type { CustomerFieldsCardProps } from './CustomerFieldsCard.types'

const { customer: copy } = ordersCopy.draft

// El documento va en la monoespaciada del DS, como el «DNI / CUIT» de S05: es
// un identificador, no prosa.
const MONO_INPUT = { input: { sx: { typography: 'dataMono' } } }

/**
 * «Datos del cliente» del paso 1: nombre, apellido, documento y, opcionales,
 * email y teléfono (TESIS-179).
 *
 * Presentacional: la página es dueña del formulario (React Hook Form) y le
 * pasa `register` y `errors`; acá sólo se decide cómo se ven los campos.
 *
 * Los tres llevan la marca de obligatorio porque los tres lo son
 * (`customerSchema`): sin ella, «Siguiente» quedaba gris sin que nada dijera
 * que faltaba el documento (TESIS-173). El `required` del input es lo que oye
 * el lector de pantalla; el asterisco del rótulo, lo que se ve.
 */
export function CustomerFieldsCard({ register, errors }: CustomerFieldsCardProps) {
  return (
    <FormSection icon={<BadgeOutlinedIcon aria-hidden />} title={copy.title}>
      <FormFieldsGrid>
        <LabeledField label={copy.fields.firstName} error={errors.firstName?.message} required>
          <TextField
            {...register('firstName')}
            required
            placeholder={copy.placeholders.firstName}
            error={errors.firstName !== undefined}
            autoComplete="given-name"
            fullWidth
          />
        </LabeledField>

        <LabeledField label={copy.fields.lastName} error={errors.lastName?.message} required>
          <TextField
            {...register('lastName')}
            required
            placeholder={copy.placeholders.lastName}
            error={errors.lastName !== undefined}
            autoComplete="family-name"
            fullWidth
          />
        </LabeledField>

        <LabeledField label={copy.fields.document} error={errors.document?.message} required>
          <TextField
            {...register('document')}
            required
            placeholder={copy.placeholders.document}
            error={errors.document !== undefined}
            slotProps={MONO_INPUT}
            fullWidth
          />
        </LabeledField>

        {/* El contacto es opcional (TESIS-179): sin asterisco. */}
        <LabeledField label={copy.fields.email} error={errors.email?.message}>
          <TextField
            {...register('email')}
            type="email"
            placeholder={copy.placeholders.email}
            error={errors.email !== undefined}
            autoComplete="email"
            fullWidth
          />
        </LabeledField>

        <LabeledField label={copy.fields.phone} error={errors.phone?.message}>
          <TextField
            {...register('phone')}
            type="tel"
            placeholder={copy.placeholders.phone}
            error={errors.phone !== undefined}
            autoComplete="tel"
            slotProps={MONO_INPUT}
            fullWidth
          />
        </LabeledField>
      </FormFieldsGrid>
    </FormSection>
  )
}
