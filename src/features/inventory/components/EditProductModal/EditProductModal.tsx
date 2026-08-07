import { zodResolver } from '@hookform/resolvers/zod'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { Button, IconButton, Menu, MenuItem, TextField, Typography } from '@mui/material'
import { useEffect, useId, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { inventoryCopy } from '../../content'
import type { Product } from '../../types'
import { parseDimensions } from '../../utils/dimensions'
import { buildUpdatePayload } from '../../utils/payload'
import { formatRelativeTime } from '../../utils/relativeTime'

import { editProductSchema } from './EditProductModal.schema'
import type { EditProductFormData } from './EditProductModal.schema'
import {
  AddWarehouseButton,
  BasicGrid,
  FooterActions,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  SectionRoot,
  SpecGrid,
  WarehouseList,
} from './EditProductModal.styles'
import type { EditProductModalProps } from './EditProductModal.types'
import { LabeledField } from './LabeledField'
import { SectionHeading } from './SectionHeading'
import { WarehouseStockField } from './WarehouseStockField'

const { modal } = inventoryCopy

// Aplana el producto de la API a la forma del formulario: las dimensiones se
// abren en tres ejes y cada stock se acompaña del nombre del depósito para
// poder pintar la fila sin volver a buscarlo en `warehouses`.
function buildDefaults(product: Product): EditProductFormData {
  const { length, width, height } = parseDimensions(product.dimensions)

  return {
    name: product.name,
    weight: product.weight,
    length,
    width,
    height,
    stocks: product.stocks.map((stock) => ({
      warehouseId: stock.warehouseId,
      warehouseName: stock.warehouse.name,
      warehouseAddress: stock.warehouse.address,
      quantity: stock.quantity,
    })),
  }
}

/**
 * Modal de edición de un producto: datos básicos, medidas y stock por depósito.
 *
 * Es presentacional: recibe el producto y los depósitos ya resueltos y entrega
 * en `onSubmit` el cuerpo listo para `PUT /api/v1/products/:id`. Quien lo monta
 * decide de dónde salen los datos y qué hacer con el resultado.
 */
export function EditProductModal({
  open,
  product,
  warehouses,
  onSubmit,
  onClose,
  submitting = false,
}: EditProductModalProps) {
  const titleId = useId()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: buildDefaults(product),
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'stocks' })

  // Al reabrir el modal (o al cambiar de producto) el formulario vuelve a los
  // valores del servidor: si el usuario canceló a mitad, esos cambios se pierden
  // a propósito.
  useEffect(() => {
    if (open) reset(buildDefaults(product))
  }, [open, product, reset])

  const assignedIds = new Set(fields.map((field) => field.warehouseId))
  const availableWarehouses = warehouses.filter((warehouse) => !assignedIds.has(warehouse.id))
  const lastUpdated = formatRelativeTime(product.updatedAt)

  const submit = handleSubmit((data) => onSubmit(buildUpdatePayload(product, data)))

  return (
    <ModalRoot open={open} onClose={onClose} aria-labelledby={titleId}>
      <ModalHeader>
        <div>
          <Typography id={titleId} variant="h2" component="h2">
            {modal.title(product.name)}
          </Typography>
          <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
            {modal.subtitle(product.sku)}
          </Typography>
        </div>
        <IconButton aria-label={modal.close} onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </ModalHeader>

      <form onSubmit={submit} noValidate>
        <ModalBody>
          <SectionRoot>
            <SectionHeading title={modal.sections.basic} />
            <BasicGrid>
              <LabeledField label={modal.fields.name} error={errors.name?.message} fullWidth>
                <TextField {...register('name')} error={errors.name !== undefined} fullWidth />
              </LabeledField>

              <LabeledField label={modal.fields.sku} helperText={modal.skuHelper}>
                <TextField value={product.sku} fullWidth disabled />
              </LabeledField>

              <LabeledField label={modal.fields.category} helperText={modal.categoryHelper}>
                <TextField value="—" fullWidth disabled />
              </LabeledField>
            </BasicGrid>
          </SectionRoot>

          <SectionRoot>
            <SectionHeading title={modal.sections.technical} />
            <SpecGrid>
              <LabeledField label={modal.fields.weight} error={errors.weight?.message}>
                <TextField
                  {...register('weight', { valueAsNumber: true })}
                  type="number"
                  inputProps={{ step: '0.01', min: 0 }}
                  error={errors.weight !== undefined}
                  fullWidth
                />
              </LabeledField>

              <LabeledField label={modal.fields.length} error={errors.length?.message}>
                <TextField
                  {...register('length', { valueAsNumber: true })}
                  type="number"
                  inputProps={{ min: 0 }}
                  error={errors.length !== undefined}
                  fullWidth
                />
              </LabeledField>

              <LabeledField label={modal.fields.width} error={errors.width?.message}>
                <TextField
                  {...register('width', { valueAsNumber: true })}
                  type="number"
                  inputProps={{ min: 0 }}
                  error={errors.width !== undefined}
                  fullWidth
                />
              </LabeledField>

              <LabeledField label={modal.fields.height} error={errors.height?.message}>
                <TextField
                  {...register('height', { valueAsNumber: true })}
                  type="number"
                  inputProps={{ min: 0 }}
                  error={errors.height !== undefined}
                  fullWidth
                />
              </LabeledField>
            </SpecGrid>
          </SectionRoot>

          <SectionRoot>
            <SectionHeading
              title={modal.sections.stock}
              action={
                <AddWarehouseButton
                  startIcon={<AddIcon />}
                  disabled={availableWarehouses.length === 0}
                  onClick={(event) => setMenuAnchor(event.currentTarget)}
                >
                  {modal.addWarehouse}
                </AddWarehouseButton>
              }
            />

            {fields.length === 0 ? (
              <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
                {modal.noWarehouses}
              </Typography>
            ) : (
              <WarehouseList>
                {fields.map((field, index) => (
                  <WarehouseStockField
                    key={field.id}
                    name={field.warehouseName}
                    address={field.warehouseAddress}
                    quantityLabel={modal.fields.available}
                    removeLabel={modal.removeWarehouse(field.warehouseName)}
                    error={errors.stocks?.[index]?.quantity?.message}
                    onRemove={() => remove(index)}
                  >
                    <TextField
                      {...register(`stocks.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      inputProps={{ min: 0, step: 1 }}
                      error={errors.stocks?.[index]?.quantity !== undefined}
                      fullWidth
                    />
                  </WarehouseStockField>
                ))}
              </WarehouseList>
            )}
          </SectionRoot>
        </ModalBody>

        <ModalFooter>
          <Typography variant="labelSm" sx={{ color: 'text.secondary' }}>
            {lastUpdated === null ? '' : modal.lastUpdated(lastUpdated)}
          </Typography>
          <FooterActions>
            <Button color="neutral" variant="text" onClick={onClose} disabled={submitting}>
              {modal.cancel}
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {modal.submit}
            </Button>
          </FooterActions>
        </ModalFooter>
      </form>

      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
        {availableWarehouses.map((warehouse) => (
          <MenuItem
            key={warehouse.id}
            onClick={() => {
              append({
                warehouseId: warehouse.id,
                warehouseName: warehouse.name,
                warehouseAddress: warehouse.address,
                quantity: 0,
              })
              setMenuAnchor(null)
            }}
          >
            {warehouse.name}
          </MenuItem>
        ))}
      </Menu>
    </ModalRoot>
  )
}
