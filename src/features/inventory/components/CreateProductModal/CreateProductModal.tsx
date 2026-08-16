import { zodResolver } from '@hookform/resolvers/zod'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import { Alert, Button, Divider, IconButton, MenuItem, TextField, Typography } from '@mui/material'
import { useEffect, useId } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { inventoryCopy } from '../../content'
import { buildCreatePayload } from '../../utils/payload'
import {
  FooterActions,
  LabeledField,
  ModalBody,
  ModalFooter,
  ModalForm,
  ModalHeader,
  ModalRoot,
} from '../ProductModalShell'

import { createProductSchema } from './CreateProductModal.schema'
import type { CreateProductFormData } from './CreateProductModal.schema'
import {
  AddWarehouseButton,
  BasicGrid,
  DimensionsRow,
  DimensionsSeparator,
  SectionRoot,
  SpecDimensions,
  SpecGrid,
  StockList,
} from './CreateProductModal.styles'
import type { CreateProductModalProps } from './CreateProductModal.types'
import { SectionHeading } from './SectionHeading'
import { StockRowField } from './StockRowField'

const { createModal: copy } = inventoryCopy

// Un SKU repetido llega de dos formas según quién lo detecte primero: la
// validación del modelo devuelve 422 con "Validation failed: Sku has already
// been taken", y el índice único de la base devuelve 409 con "SKU already
// exists" sólo si dos requests corren la carrera. Las dos nombran al SKU, así
// que alcanza con buscar esa palabra para saber qué campo resaltar.
function isSkuConflict(message: string) {
  return /sku/i.test(message)
}

// Un producto nuevo arranca con una fila de stock: el frame la muestra siempre
// presente, y así el alta más común —un depósito— no pide ninguna acción extra.
// `warehouseId: 0` es "sin elegir"; el schema lo rechaza hasta que se elige.
const EMPTY_FORM: CreateProductFormData = {
  name: '',
  sku: '',
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  stocks: [{ warehouseId: 0, quantity: 0 }],
}

/**
 * Modal de alta de producto: datos básicos, medidas y stock inicial por depósito.
 *
 * Presentacional: recibe los depósitos ya resueltos y entrega en `onSubmit` el
 * cuerpo listo para `POST /api/v1/products`. Quien lo monta decide de dónde
 * salen los datos y qué hacer con el resultado.
 */
export function CreateProductModal({
  open,
  warehouses,
  onSubmit,
  onClose,
  submitting = false,
  submitError,
}: CreateProductModalProps) {
  const titleId = useId()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: EMPTY_FORM,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'stocks' })

  // Cada apertura arranca en blanco: es un alta, no la continuación de la
  // anterior.
  useEffect(() => {
    if (open) reset(EMPTY_FORM)
  }, [open, reset])

  // El error del servidor no cierra el modal: si es por el SKU se resalta ese
  // campo para corregir ahí mismo, como pide la card. Cualquier otro se muestra
  // arriba del formulario, porque no se sabe a qué campo pertenece.
  useEffect(() => {
    if (submitError !== undefined && isSkuConflict(submitError)) {
      setError('sku', { message: copy.skuTaken })
    }
  }, [submitError, setError])

  const generalError =
    submitError !== undefined && !isSkuConflict(submitError) ? submitError : undefined

  const assignedIds = new Set(fields.map((field) => field.warehouseId))
  const hasWarehousesLeft = warehouses.some((warehouse) => !assignedIds.has(warehouse.id))
  const canAddRow = warehouses.length > 0 && fields.length < warehouses.length

  const submit = handleSubmit((data) => onSubmit(buildCreatePayload(data)))

  return (
    <ModalRoot open={open} onClose={onClose} aria-labelledby={titleId}>
      <ModalHeader>
        <div>
          <Typography id={titleId} variant="h2" component="h2">
            {copy.title}
          </Typography>
          <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
            {copy.subtitle}
          </Typography>
        </div>
        <IconButton aria-label={copy.close} onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </ModalHeader>

      <ModalForm onSubmit={submit} noValidate>
        <ModalBody>
          {generalError === undefined ? null : (
            <Alert severity="error" variant="outlined">
              {generalError}
            </Alert>
          )}

          <SectionRoot>
            <SectionHeading icon={<InfoOutlinedIcon />} title={copy.sections.basic} />
            <BasicGrid>
              <LabeledField label={copy.fields.name} error={errors.name?.message} fullWidth>
                <TextField
                  {...register('name')}
                  placeholder={copy.placeholders.name}
                  error={errors.name !== undefined}
                  fullWidth
                />
              </LabeledField>

              <LabeledField label={copy.fields.sku} error={errors.sku?.message}>
                <TextField
                  {...register('sku')}
                  placeholder={copy.placeholders.sku}
                  error={errors.sku !== undefined}
                  fullWidth
                />
              </LabeledField>

              <LabeledField label={copy.fields.category} helperText={copy.categoryHelper}>
                <TextField value="—" fullWidth disabled />
              </LabeledField>
            </BasicGrid>
          </SectionRoot>

          <Divider />

          <SectionRoot>
            <SectionHeading icon={<StraightenOutlinedIcon />} title={copy.sections.technical} />
            <SpecGrid>
              <LabeledField label={copy.fields.weight} error={errors.weight?.message}>
                <TextField
                  {...register('weight', { valueAsNumber: true })}
                  type="number"
                  placeholder={copy.placeholders.weight}
                  inputProps={{ step: '0.01', min: 0 }}
                  error={errors.weight !== undefined}
                  fullWidth
                />
              </LabeledField>

              <SpecDimensions>
                <LabeledField
                  label={copy.fields.dimensions}
                  error={errors.length?.message ?? errors.width?.message ?? errors.height?.message}
                >
                  <DimensionsRow>
                    <TextField
                      {...register('length', { valueAsNumber: true })}
                      type="number"
                      placeholder={copy.placeholders.length}
                      inputProps={{ min: 0 }}
                      error={errors.length !== undefined}
                      fullWidth
                    />
                    <DimensionsSeparator aria-hidden>×</DimensionsSeparator>
                    <TextField
                      {...register('width', { valueAsNumber: true })}
                      type="number"
                      placeholder={copy.placeholders.width}
                      inputProps={{ min: 0 }}
                      error={errors.width !== undefined}
                      fullWidth
                    />
                    <DimensionsSeparator aria-hidden>×</DimensionsSeparator>
                    <TextField
                      {...register('height', { valueAsNumber: true })}
                      type="number"
                      placeholder={copy.placeholders.height}
                      inputProps={{ min: 0 }}
                      error={errors.height !== undefined}
                      fullWidth
                    />
                  </DimensionsRow>
                </LabeledField>
              </SpecDimensions>
            </SpecGrid>
          </SectionRoot>

          <Divider />

          <SectionRoot>
            <SectionHeading
              icon={<WarehouseOutlinedIcon />}
              title={copy.sections.stock}
              action={
                <AddWarehouseButton
                  startIcon={<AddIcon />}
                  disabled={!canAddRow}
                  onClick={() => append({ warehouseId: 0, quantity: 0 })}
                >
                  {copy.addWarehouse}
                </AddWarehouseButton>
              }
            />

            {warehouses.length === 0 ? (
              <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
                {copy.noWarehouses}
              </Typography>
            ) : (
              <StockList>
                {fields.map((field, index) => (
                  <StockRowField
                    key={field.id}
                    warehouseLabel={
                      index === 0 ? copy.fields.warehousePrimary : copy.fields.warehouse
                    }
                    quantityLabel={copy.fields.quantity}
                    warehouseError={errors.stocks?.[index]?.warehouseId?.message}
                    quantityError={errors.stocks?.[index]?.quantity?.message}
                    onRemove={index === 0 ? undefined : () => remove(index)}
                    removeLabel={copy.removeRow(index + 1)}
                    warehouseField={
                      <TextField
                        {...register(`stocks.${index}.warehouseId`, { valueAsNumber: true })}
                        select
                        defaultValue={0}
                        error={errors.stocks?.[index]?.warehouseId !== undefined}
                        fullWidth
                      >
                        <MenuItem value={0} disabled>
                          {copy.selectWarehouse}
                        </MenuItem>
                        {warehouses.map((warehouse) => (
                          <MenuItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                    quantityField={
                      <TextField
                        {...register(`stocks.${index}.quantity`, { valueAsNumber: true })}
                        type="number"
                        inputProps={{ min: 0, step: 1 }}
                        error={errors.stocks?.[index]?.quantity !== undefined}
                        fullWidth
                      />
                    }
                  />
                ))}
              </StockList>
            )}

            {/* El refine de duplicados vive en el array, no en una fila. */}
            {errors.stocks?.root === undefined ? null : (
              <Typography variant="labelSm" role="alert" sx={{ color: 'error.main' }}>
                {errors.stocks.root.message}
              </Typography>
            )}

            {hasWarehousesLeft || warehouses.length === 0 ? null : (
              <Typography variant="labelSm" sx={{ color: 'text.secondary' }}>
                {copy.noWarehousesLeft}
              </Typography>
            )}
          </SectionRoot>
        </ModalBody>

        <ModalFooter sx={{ justifyContent: 'flex-end' }}>
          <FooterActions>
            <Button color="neutral" variant="text" onClick={onClose} disabled={submitting}>
              {copy.cancel}
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? copy.submitting : copy.submit}
            </Button>
          </FooterActions>
        </ModalFooter>
      </ModalForm>
    </ModalRoot>
  )
}
