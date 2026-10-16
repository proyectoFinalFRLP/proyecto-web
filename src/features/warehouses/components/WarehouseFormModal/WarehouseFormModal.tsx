import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, MenuItem, TextField } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  LabeledField,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  ModalForm,
  ModalFrame,
} from 'shared/components'

import { warehousesCopy } from '../../content'
import type { Warehouse } from '../../types'

import { warehouseFormSchema } from './WarehouseFormModal.schema'
import type { WarehouseFormData } from './WarehouseFormModal.schema'
import { LocalityRow } from './WarehouseFormModal.styles'
import type { WarehouseFormModalProps } from './WarehouseFormModal.types'

const copy = warehousesCopy.form

function defaultsFor(warehouse: Warehouse | undefined): WarehouseFormData {
  return {
    name: warehouse?.name ?? '',
    address: warehouse?.address ?? '',
    zipCode: warehouse?.zipCode ?? '',
    city: warehouse?.city ?? '',
    province: warehouse?.province ?? '',
  }
}

function provincePlaceholder(loading: boolean, failed: boolean): string {
  if (loading) return copy.provincesLoading
  if (failed) return copy.provincesError
  return copy.placeholders.province
}

/**
 * Alta y edición de un depósito. Presentacional: entrega en `onSubmit` los
 * datos validados y quien lo monta decide a qué endpoint van.
 */
export function WarehouseFormModal({
  open,
  warehouse,
  submitting = false,
  error,
  provinces,
  provincesLoading = false,
  provincesError = false,
  onSubmit,
  onClose,
}: WarehouseFormModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: defaultsFor(warehouse),
  })

  // Cada apertura parte de lo que hay en el servidor (o de vacío en un alta):
  // lo tipeado y cancelado la vez anterior se descarta a propósito.
  useEffect(() => {
    if (open) reset(defaultsFor(warehouse))
  }, [open, warehouse, reset])

  const editing = warehouse !== undefined

  return (
    <ModalFrame
      open={open}
      size="sm"
      title={editing ? copy.editTitle(warehouse.name) : copy.createTitle}
      subtitle={copy.subtitle}
      closeLabel={copy.close}
      onClose={onClose}
      busy={submitting}
    >
      <ModalForm onSubmit={handleSubmit(onSubmit)} noValidate>
        <ModalBody>
          {error === undefined ? null : <Alert severity="error">{error}</Alert>}

          <LabeledField label={copy.fields.name} error={errors.name?.message} fullWidth>
            <TextField
              {...register('name')}
              placeholder={copy.placeholders.name}
              error={errors.name !== undefined}
              fullWidth
            />
          </LabeledField>

          <LabeledField label={copy.fields.address} error={errors.address?.message} fullWidth>
            <TextField
              {...register('address')}
              placeholder={copy.placeholders.address}
              error={errors.address !== undefined}
              fullWidth
            />
          </LabeledField>

          <LabeledField label={copy.fields.zipCode} error={errors.zipCode?.message} fullWidth>
            <TextField
              {...register('zipCode')}
              placeholder={copy.placeholders.zipCode}
              error={errors.zipCode !== undefined}
              fullWidth
            />
          </LabeledField>

          <LocalityRow>
            <LabeledField label={copy.fields.city} error={errors.city?.message}>
              <TextField
                {...register('city')}
                placeholder={copy.placeholders.city}
                error={errors.city !== undefined}
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
                    // Sin la lista no hay qué elegir; lo que ya tenía el
                    // depósito se conserva igual porque el valor no cambia.
                    disabled={provincesLoading || provincesError}
                    fullWidth
                    slotProps={{
                      select: {
                        // El Select de MUI se dibuja en un `div` que el
                        // `<label>` de LabeledField no nombra.
                        SelectDisplayProps: { 'aria-label': copy.fields.province },
                        displayEmpty: true,
                        renderValue: (value) =>
                          value === ''
                            ? provincePlaceholder(provincesLoading, provincesError)
                            : String(value),
                      },
                    }}
                  >
                    <MenuItem value="">{copy.noProvince}</MenuItem>
                    {provinces.map((province) => (
                      <MenuItem key={province} value={province}>
                        {province}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </LabeledField>
          </LocalityRow>
        </ModalBody>

        <ModalFooter>
          <ModalFooterActions>
            <Button color="neutral" variant="text" onClick={onClose} disabled={submitting}>
              {copy.cancel}
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {editing ? copy.submitEdit : copy.submitCreate}
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </ModalForm>
    </ModalFrame>
  )
}
