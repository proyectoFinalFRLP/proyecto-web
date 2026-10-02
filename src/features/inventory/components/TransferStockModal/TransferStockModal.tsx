import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, MenuItem, TextField } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  LabeledField,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  ModalFooterNote,
  ModalForm,
  ModalFrame,
} from 'shared/components'

import { inventoryCopy } from '../../content'

import { transferStockSchema } from './TransferStockModal.schema'
import type { TransferStockFormData } from './TransferStockModal.schema'
import type { TransferStockModalProps } from './TransferStockModal.types'

const copy = inventoryCopy.detail.transferModal

const EMPTY_FORM: TransferStockFormData = { originId: 0, destinationId: 0, quantity: Number.NaN }

/**
 * Modal para mover unidades de un producto entre dos depósitos.
 *
 * Presentacional, como el de edición: recibe el producto y los depósitos y
 * entrega en `onSubmit` el cuerpo listo para `POST /api/v1/stock-transfers`.
 *
 * El origen sólo ofrece depósitos con unidades del producto: transferir desde
 * uno vacío siempre termina en 422. El destino ofrece cualquier otro depósito
 * de la empresa, tenga o no stock del producto.
 */
export function TransferStockModal({
  open,
  product,
  warehouses,
  submitting = false,
  error,
  onSubmit,
  onClose,
}: TransferStockModalProps) {
  const origins = useMemo(
    () => product.stocks.filter((stock) => stock.quantity > 0),
    [product.stocks],
  )
  const unitsByWarehouse = useMemo(
    () => new Map(origins.map((stock) => [stock.warehouseId, stock.quantity])),
    [origins],
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferStockFormData>({
    resolver: zodResolver(transferStockSchema(unitsByWarehouse)),
    defaultValues: EMPTY_FORM,
  })

  // Cada apertura arranca de cero: un formulario a medio cargar de la vez
  // anterior podría despachar unidades que el usuario ya no quería mover.
  useEffect(() => {
    if (open) reset(EMPTY_FORM)
  }, [open, reset])

  const originId = useWatch({ control, name: 'originId' })
  const available = unitsByWarehouse.get(originId)
  const destinations = warehouses.filter((warehouse) => warehouse.id !== originId)

  const submit = handleSubmit((data) =>
    onSubmit({
      stock_transfer: {
        product_id: product.id,
        origin_warehouse_id: data.originId,
        destination_warehouse_id: data.destinationId,
        quantity: data.quantity,
      },
    }),
  )

  return (
    <ModalFrame
      open={open}
      size="sm"
      title={copy.title}
      subtitle={copy.subtitle(product.sku)}
      closeLabel={copy.close}
      onClose={onClose}
      busy={submitting}
    >
      <ModalForm onSubmit={submit} noValidate>
        <ModalBody>
          {error === undefined ? null : <Alert severity="error">{error}</Alert>}

          <LabeledField label={copy.fields.origin} error={errors.originId?.message} fullWidth>
            <TextField
              select
              {...register('originId', { valueAsNumber: true })}
              defaultValue={0}
              error={errors.originId !== undefined}
              fullWidth
              // El `<label>` de LabeledField no nombra al combobox: el Select de
              // MUI lo dibuja en un `div`, que no es un control etiquetable.
              slotProps={{ select: { SelectDisplayProps: { 'aria-label': copy.fields.origin } } }}
            >
              <MenuItem value={0} disabled>
                —
              </MenuItem>
              {origins.map((stock) => (
                <MenuItem key={stock.warehouseId} value={stock.warehouseId}>
                  {copy.originOption(stock.warehouse.name, stock.quantity)}
                </MenuItem>
              ))}
            </TextField>
          </LabeledField>

          <LabeledField
            label={copy.fields.destination}
            error={errors.destinationId?.message}
            fullWidth
          >
            <TextField
              select
              {...register('destinationId', { valueAsNumber: true })}
              defaultValue={0}
              error={errors.destinationId !== undefined}
              fullWidth
              // El `<label>` de LabeledField no nombra al combobox: el Select de
              // MUI lo dibuja en un `div`, que no es un control etiquetable.
              slotProps={{
                select: { SelectDisplayProps: { 'aria-label': copy.fields.destination } },
              }}
            >
              <MenuItem value={0} disabled>
                —
              </MenuItem>
              {destinations.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </TextField>
          </LabeledField>

          <LabeledField
            label={copy.fields.quantity}
            error={errors.quantity?.message}
            helperText={available === undefined ? undefined : copy.quantityHelper(available)}
            fullWidth
          >
            <TextField
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              error={errors.quantity !== undefined}
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: available, step: 1 } }}
            />
          </LabeledField>
        </ModalBody>

        <ModalFooter>
          <ModalFooterNote variant="labelSm">{copy.note}</ModalFooterNote>
          <ModalFooterActions>
            <Button color="neutral" variant="text" onClick={onClose} disabled={submitting}>
              {copy.cancel}
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {copy.submit}
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </ModalForm>
    </ModalFrame>
  )
}
