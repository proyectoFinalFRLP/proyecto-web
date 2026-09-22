import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { MenuItem, TextField } from '@mui/material'
import { Controller } from 'react-hook-form'
import { LabeledField } from 'shared/components'

import { ordersCopy } from '../../content'
import { FormSection } from '../FormSection'

import { LocalityGrid } from './DestinationFieldsCard.styles'
import type { DestinationFieldsCardProps } from './DestinationFieldsCard.types'

const { destination: copy } = ordersCopy.shipping

// El código postal va en la monoespaciada del DS, como en S06: es un código.
const MONO_INPUT = { input: { sx: { typography: 'dataMono' } } }

function provincePlaceholder(loading: boolean, failed: boolean): string {
  if (loading) return copy.provincesLoading
  if (failed) return copy.provincesError
  return copy.placeholders.province
}

/**
 * «Domicilio de entrega» del paso 2: calle y número, ciudad, provincia y código
 * postal.
 *
 * El diseño muestra además destinatario y teléfono, que la orden no guarda: no
 * se piden, igual que el email y el teléfono del paso 1.
 *
 * Presentacional: la página es dueña del formulario (React Hook Form).
 */
export function DestinationFieldsCard({
  register,
  control,
  errors,
  provinces,
  provincesLoading,
  provincesError,
}: DestinationFieldsCardProps) {
  return (
    <FormSection icon={<LocationOnOutlinedIcon aria-hidden />} title={copy.title}>
      <LabeledField label={copy.fields.address} error={errors.address?.message} fullWidth>
        <TextField
          {...register('address')}
          placeholder={copy.placeholders.address}
          error={errors.address !== undefined}
          autoComplete="street-address"
          fullWidth
        />
      </LabeledField>

      <LocalityGrid>
        <LabeledField label={copy.fields.city} error={errors.city?.message}>
          <TextField
            {...register('city')}
            placeholder={copy.placeholders.city}
            error={errors.city !== undefined}
            autoComplete="address-level2"
            fullWidth
          />
        </LabeledField>

        <LabeledField label={copy.fields.province} error={errors.province?.message}>
          <Controller
            name="province"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                error={errors.province !== undefined}
                disabled={provincesLoading || provincesError}
                fullWidth
                slotProps={{
                  select: {
                    displayEmpty: true,
                    renderValue: (value) =>
                      value === ''
                        ? provincePlaceholder(provincesLoading, provincesError)
                        : String(value),
                  },
                }}
              >
                {provinces.map((province) => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </LabeledField>

        <LabeledField label={copy.fields.zipCode} error={errors.zipCode?.message}>
          <TextField
            {...register('zipCode')}
            placeholder={copy.placeholders.zipCode}
            error={errors.zipCode !== undefined}
            autoComplete="postal-code"
            slotProps={MONO_INPUT}
            fullWidth
          />
        </LabeledField>
      </LocalityGrid>
    </FormSection>
  )
}
