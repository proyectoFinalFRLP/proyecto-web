import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Typography } from '@mui/material'
import { DataTable } from 'shared/components'
import type { DataTableAction, DataTableColumn } from 'shared/components'
import type { OrderDraftItem } from 'shared/store'

import { ordersCopy } from '../../content'
import { formatMoney, formatWeight } from '../../utils/format'
import { lineSubtotal } from '../../utils/payment'

import type { DraftItemsTableProps } from './DraftItemsTable.types'
import { QuantityCell } from './QuantityCell'

const { products: copy } = ordersCopy.draft

// Un SKU o un importe partidos en dos renglones dejan de leerse como un dato.
const NO_WRAP = { whiteSpace: 'nowrap' } as const

/**
 * Las columnas de la tabla de S05 más el precio y el subtotal, que la card
 * pide y el diseño no dibuja: sin precio no hay orden que enviar.
 */
function buildColumns(
  onQuantityChange: DraftItemsTableProps['onQuantityChange'],
): DataTableColumn<OrderDraftItem>[] {
  return [
    {
      id: 'sku',
      header: copy.columns.sku,
      width: 140,
      render: (item) => (
        <Typography variant="dataMono" color="primary.main" sx={NO_WRAP}>
          {item.sku}
        </Typography>
      ),
    },
    {
      id: 'product',
      header: copy.columns.product,
      render: (item) => <Typography variant="bodyMd">{item.name}</Typography>,
    },
    {
      id: 'category',
      header: copy.columns.category,
      width: 130,
      render: (item) => (
        <Typography
          variant="bodyMd"
          color={item.category === null ? 'text.disabled' : 'text.secondary'}
        >
          {item.category ?? copy.noCategory}
        </Typography>
      ),
    },
    {
      id: 'weight',
      header: copy.columns.weight,
      align: 'right',
      width: 120,
      render: (item) => (
        <Typography variant="dataMono" sx={NO_WRAP}>
          {formatWeight(item.weight)}
        </Typography>
      ),
    },
    {
      id: 'unitPrice',
      header: copy.columns.unitPrice,
      align: 'right',
      width: 150,
      render: (item) => (
        <Typography variant="dataMono" sx={NO_WRAP}>
          {formatMoney(item.unitPrice)}
        </Typography>
      ),
    },
    {
      id: 'quantity',
      header: copy.columns.quantity,
      align: 'right',
      width: 120,
      render: (item) => (
        <QuantityCell
          item={item}
          onChange={(quantity) => onQuantityChange(item.productId, quantity)}
        />
      ),
    },
    {
      id: 'subtotal',
      header: copy.columns.subtotal,
      align: 'right',
      width: 160,
      render: (item) => (
        <Typography variant="dataMono" sx={NO_WRAP}>
          {formatMoney(Number.isFinite(item.quantity) ? lineSubtotal(item) : 0)}
        </Typography>
      ),
    },
  ]
}

/**
 * Las líneas cargadas hasta ahora en el paso 1. Presentacional: recibe el
 * borrador y avisa cada cambio; quién lo guarda es asunto de la página.
 */
export function DraftItemsTable({
  items,
  onQuantityChange,
  onRemove,
  toolbar,
}: DraftItemsTableProps) {
  const actions: DataTableAction<OrderDraftItem>[] = [
    {
      id: 'remove',
      label: copy.remove,
      icon: <DeleteOutlineIcon fontSize="small" />,
      tone: 'danger',
      onSelect: (item) => onRemove(item.productId),
    },
  ]

  return (
    <DataTable
      title={copy.title}
      label={copy.tableLabel}
      columns={buildColumns(onQuantityChange)}
      rows={items}
      getRowId={(item) => item.productId}
      density="compact"
      toolbarActions={toolbar}
      actions={actions}
      actionsHeader={copy.columns.actions}
      getActionsLabel={(item) => copy.menuFor(item.sku)}
      footer={items.length === 0 ? undefined : copy.footer(items.length)}
      emptyMessage={copy.empty}
    />
  )
}
