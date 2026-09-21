import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import { TextField, Typography } from '@mui/material'
import { useId } from 'react'
import { LabeledField } from 'shared/components'

import { ordersCopy } from '../../content'

import { FieldsGrid, SectionCard, SectionHeading } from './CustomerFieldsCard.styles'
import type { CustomerFieldsCardProps } from './CustomerFieldsCard.types'

const { customer: copy } = ordersCopy.draft

// El documento va en la monoespaciada del DS, como el «DNI / CUIT» de S05: es
// un identificador, no prosa.
const MONO_INPUT = { input: { sx: { typography: 'dataMono' } } }

/**
 * «Datos del cliente» del paso 1: nombre, apellido y documento.
 *
 * Presentacional: la página es dueña del formulario (React Hook Form) y le
 * pasa `register` y `errors`; acá sólo se decide cómo se ven los campos.
 */
export function CustomerFieldsCard({ register, errors }: CustomerFieldsCardProps) {
  const titleId = useId()

  return (
    <SectionCard component="section" aria-labelledby={titleId}>
      <SectionHeading>
        <BadgeOutlinedIcon aria-hidden />
        <Typography id={titleId} variant="h3" component="h2">
          {copy.title}
        </Typography>
      </SectionHeading>

      <FieldsGrid>
        <LabeledField label={copy.fields.firstName} error={errors.firstName?.message}>
          <TextField
            {...register('firstName')}
            placeholder={copy.placeholders.firstName}
            error={errors.firstName !== undefined}
            autoComplete="given-name"
            fullWidth
          />
        </LabeledField>

        <LabeledField label={copy.fields.lastName} error={errors.lastName?.message}>
          <TextField
            {...register('lastName')}
            placeholder={copy.placeholders.lastName}
            error={errors.lastName !== undefined}
            autoComplete="family-name"
            fullWidth
          />
        </LabeledField>

        <LabeledField label={copy.fields.document} error={errors.document?.message}>
          <TextField
            {...register('document')}
            placeholder={copy.placeholders.document}
            error={errors.document !== undefined}
            slotProps={MONO_INPUT}
            fullWidth
          />
        </LabeledField>
      </FieldsGrid>
    </SectionCard>
  )
}
