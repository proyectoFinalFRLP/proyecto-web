import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import type { WarehouseFormModalProps } from './WarehouseFormModal.types'

const copy = warehousesCopy.form

function defaultsFor(warehouse: Warehouse | undefined): WarehouseFormData {
  return {
    name: warehouse?.name ?? '',
    address: warehouse?.address ?? '',
    zipCode: warehouse?.zipCode ?? '',
  }
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
  onSubmit,
  onClose,
}: WarehouseFormModalProps) {
  const {
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
