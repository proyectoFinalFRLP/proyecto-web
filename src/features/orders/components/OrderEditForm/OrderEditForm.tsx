import { zodResolver } from '@hookform/resolvers/zod'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { Alert, Box, Button, Stack } from '@mui/material'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { notify } from 'shared/store'
import type { OrderDraftItem } from 'shared/store'

import { ordersCopy } from '../../content'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useOriginWarehouses } from '../../hooks/useOriginWarehouses'
import { useProductStocks } from '../../hooks/useProductStocks'
import { useProvinces } from '../../hooks/useProvinces'
import {
  NOT_EDITABLE_STATUS,
  STALE_VERSION_STATUS,
  useUpdateOrder,
} from '../../hooks/useUpdateOrder'
import {
  editSubtotal,
  isQuantityValid,
  linesChanged,
  linesOverStock,
  toEditLines,
  toUpdatePayload,
} from '../../utils/edit'
import type { EditLine } from '../../utils/edit'
import { statusLabel, statusVariant } from '../../utils/status'
import { DestinationFieldsCard, destinationSchema } from '../DestinationFieldsCard'
import type { DestinationFormData } from '../DestinationFieldsCard'
import { EditLinesTable } from '../EditLinesTable'
import { InfoPanel } from '../InfoPanel'
import { NewLineToolbar } from '../NewLineToolbar'
import { OrderContextCard, orderContextSchema } from '../OrderContextCard'
import type { OrderContextFormData } from '../OrderContextCard'
import { OrderEditHeader } from '../OrderEditHeader'
import { RecalcCard } from '../RecalcCard'

import {
  contextDefaults,
  destinationDefaults,
  lockReason,
  shipmentFields,
} from './OrderEditForm.logic'
import type { OrderEditFormProps } from './OrderEditForm.types'

const { edit } = ordersCopy

const CONTENT_GRID = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' },
  alignItems: 'start',
}

// El depósito del que sale la mayoría de las líneas: es donde arranca el
// selector de la línea nueva, porque una orden sale casi siempre de uno solo.
function mostUsedWarehouse(lines: EditLine[]): number | null {
  const counts = new Map<number, number>()
  lines.forEach((line) => {
    if (line.warehouseId !== null)
      counts.set(line.warehouseId, (counts.get(line.warehouseId) ?? 0) + 1)
  })
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return top === undefined ? null : top[0]
}

/**
 * El formulario de la modificación de una orden (S09). Lo monta
 * `OrderEditPage` cuando la orden ya cargó, con una `key` por versión: si la
 * orden cambia de afuera y se recarga, el formulario arranca de nuevo con la
 * orden como quedó.
 *
 * Tres cosas se editan por separado y se guardan juntas en un solo `PUT`: los
 * datos de la orden y el domicilio (dos formularios de React Hook Form, cada
 * uno con su schema) y las líneas (estado local: se agregan, se quitan y
 * cambian de cantidad fila por fila).
 */
export function OrderEditForm({
  order,
  orderLabel,
  shipment,
  ordersPath,
  detailPath,
  onReload,
}: OrderEditFormProps) {
  const navigate = useNavigate()

  const original = useMemo(() => toEditLines(order), [order])
  const [lines, setLines] = useState<EditLine[]>(original)
  const [newLineWarehouse, setNewLineWarehouse] = useState(() => mostUsedWarehouse(original))

  const warehouses = useOriginWarehouses()
  const catalog = useCatalogProducts()
  const provinces = useProvinces()
  const stocks = useProductStocks([
    ...new Set([...original, ...lines].map((line) => line.productId)),
  ])
  const update = useUpdateOrder(order.id, order.version)

  const context = useForm<OrderContextFormData>({
    resolver: zodResolver(orderContextSchema),
    mode: 'onChange',
    defaultValues: contextDefaults(order),
  })
  const destination = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    mode: 'onChange',
    defaultValues: destinationDefaults(order),
  })

  const locked = lockReason(order, shipment)
  const readOnly = locked !== null
  const removed = original.filter((line) => !lines.some((current) => current.key === line.key))
  const overStock = linesOverStock(lines, removed, stocks.stocks)
  const changed = linesChanged(original, lines)
  const dirty = changed || context.formState.isDirty || destination.formState.isDirty
  const canSave =
    !readOnly &&
    dirty &&
    context.formState.isValid &&
    destination.formState.isValid &&
    lines.length > 0 &&
    lines.every((line) => isQuantityValid(line.quantity)) &&
    overStock.size === 0

  const currentStatus = useWatch({ control: context.control, name: 'status' })
  const warehouseName = (id: number) =>
    warehouses.data?.find((warehouse) => warehouse.id === id)?.name ?? `#${id}`

  function changeQuantity(key: string, quantity: number) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, quantity } : line)))
  }

  function addLine(item: OrderDraftItem) {
    if (newLineWarehouse === null) return
    setLines((current) => [
      ...current,
      {
        key: `new-${item.productId}`,
        id: null,
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        originalQuantity: 0,
        warehouseId: newLineWarehouse,
      },
    ])
  }

  function save() {
    const payload = toUpdatePayload(
      { ...context.getValues(), ...destination.getValues() },
      lines,
      changed,
    )
    update.mutate(payload, {
      onSuccess: () => {
        notify(edit.saved, 'success')
        void navigate(detailPath)
      },
    })
  }

  return (
    <Stack spacing={3}>
      <OrderEditHeader
        orderLabel={orderLabel}
        ordersPath={ordersPath}
        detailPath={detailPath}
        statusLabel={statusLabel(readOnly ? order.status : currentStatus)}
        statusVariant={statusVariant(readOnly ? order.status : currentStatus)}
        saving={update.isPending}
        saveDisabled={!canSave}
        onDiscard={() => void navigate(detailPath)}
        onSave={save}
      />

      {locked === null ? (
        <Alert severity="info" variant="outlined">
          {edit.info}
        </Alert>
      ) : (
        <Alert severity="warning" variant="outlined">
          {edit.notEditable[locked]}
        </Alert>
      )}

      <SaveError error={update.error} onReload={onReload} />

      <Box sx={CONTENT_GRID}>
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          {stocks.isError ? (
            <Alert severity="warning" variant="outlined">
              {edit.lines.stockError}
            </Alert>
          ) : null}
          <EditLinesTable
            lines={lines}
            overStock={overStock}
            warehouseName={warehouseName}
            onQuantityChange={changeQuantity}
            onRemove={(key) => setLines((current) => current.filter((line) => line.key !== key))}
            readOnly={readOnly}
            toolbar={
              <NewLineToolbar
                products={catalog.data ?? []}
                productsLoading={catalog.isPending}
                addedIds={new Set(lines.map((line) => line.productId))}
                warehouses={warehouses.data ?? []}
                warehouseId={newLineWarehouse}
                onWarehouseChange={setNewLineWarehouse}
                onAdd={addLine}
                disabled={readOnly}
              />
            }
          />
          <OrderContextCard
            register={context.register}
            control={context.control}
            errors={context.formState.errors}
            readOnly={readOnly}
          />
          <DestinationFieldsCard
            register={destination.register}
            control={destination.control}
            errors={destination.formState.errors}
            provinces={provinces.data ?? []}
            provincesLoading={provinces.isPending}
            provincesError={provinces.isError}
            readOnly={readOnly}
          />
        </Stack>

        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <InfoPanel
            title={edit.shipment.title}
            icon={<LocalShippingOutlinedIcon aria-hidden />}
            fields={shipmentFields(shipment)}
            footnote={edit.shipment.footnote}
          />
          <RecalcCard
            previousSubtotal={order.totalAmount ?? editSubtotal(original)}
            nextSubtotal={editSubtotal(lines)}
            shippingCost={shipment?.kind === 'single' ? shipment.shipment.shippingCost : null}
          />
        </Stack>
      </Box>
    </Stack>
  )
}

/**
 * Por qué no se guardó. El 412 y el 409 tienen su propio mensaje porque el
 * operador puede hacer algo distinto en cada caso; el resto muestra lo que
 * rechazó el backend (stock que no alcanza, un dato inválido), que es lo que
 * hay que corregir.
 */
function SaveError({
  error,
  onReload,
}: {
  error: ReturnType<typeof useUpdateOrder>['error']
  onReload: () => void
}) {
  if (error === null) return null

  if (error.status === STALE_VERSION_STATUS) {
    return (
      <Alert
        severity="warning"
        variant="outlined"
        action={
          <Button color="inherit" size="small" onClick={onReload}>
            {edit.errors.reload}
          </Button>
        }
      >
        {edit.errors.stale}
      </Alert>
    )
  }

  const message =
    error.status === NOT_EDITABLE_STATUS
      ? edit.errors.notEditable
      : `${edit.errors.generic} ${error.message}`

  return (
    <Alert severity="error" variant="outlined">
      {message}
    </Alert>
  )
}
