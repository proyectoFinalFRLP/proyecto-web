import { MenuItem, Stack, TextField } from '@mui/material'
import type { OrderDraftItem } from 'shared/store'

import { ordersCopy } from '../content'
import type { CatalogProduct, OriginWarehouse } from '../types'

import { ProductPicker } from './ProductPicker'

const { add: copy } = ordersCopy.edit.lines

export interface NewLineToolbarProps {
  products: CatalogProduct[]
  productsLoading: boolean
  /** Productos que ya tienen línea: se ven pero no se pueden volver a elegir. */
  addedIds: ReadonlySet<number>
  warehouses: OriginWarehouse[]
  warehouseId: number | null
  onWarehouseChange: (warehouseId: number) => void
  onAdd: (item: OrderDraftItem) => void
  disabled: boolean
}

/**
 * «Agregar línea» de S09: el depósito del que sale la línea nueva y el mismo
 * buscador del paso 1 del alta (producto, cantidad y precio).
 *
 * El depósito va primero y es obligatorio: la API lo pide en cada línea nueva
 * (`warehouse_id`), y con ese dato la pantalla puede avisar si alcanza el
 * stock antes de guardar. Arranca en el depósito de las líneas existentes,
 * que es de donde sale la orden casi siempre.
 */
export function NewLineToolbar({
  products,
  productsLoading,
  addedIds,
  warehouses,
  warehouseId,
  onWarehouseChange,
  onAdd,
  disabled,
}: NewLineToolbarProps) {
  if (disabled) return null

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <TextField
        select
        size="small"
        label={copy.warehouse}
        value={warehouseId ?? ''}
        onChange={(event) => onWarehouseChange(Number(event.target.value))}
        sx={{ minWidth: 200 }}
        slotProps={{
          select: {
            displayEmpty: true,
            renderValue: (value) =>
              value === ''
                ? copy.warehousePlaceholder
                : (warehouses.find((warehouse) => warehouse.id === value)?.name ?? ''),
          },
        }}
      >
        {warehouses.map((warehouse) => (
          <MenuItem key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </MenuItem>
        ))}
      </TextField>
      {warehouseId === null ? null : (
        <ProductPicker
          products={products}
          loading={productsLoading}
          addedIds={addedIds}
          onAdd={onAdd}
        />
      )}
    </Stack>
  )
}
