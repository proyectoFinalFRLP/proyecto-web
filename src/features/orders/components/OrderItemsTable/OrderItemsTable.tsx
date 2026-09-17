import { Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { DataTable } from 'shared/components'
import type { DataTableColumn } from 'shared/components'

import { formatCount, ordersCopy } from '../../content'
import type { OrderLine } from '../../types'
import { formatMoney } from '../../utils/format'
import { lineSubtotal, totalUnits } from '../../utils/payment'

import type { OrderItemsTableProps } from './OrderItemsTable.types'

const itemsCopy = ordersCopy.detail.items

/**
 * Las cinco columnas de «Líneas de la orden» en S08. El SKU enlaza al detalle
 * del producto, como en el diseño.
 */
function buildColumns(
  productPath: OrderItemsTableProps['productPath'],
): DataTableColumn<OrderLine>[] {
  return [
    {
      id: 'sku',
      header: itemsCopy.columns.sku,
      width: 140,
      render: (line) => (
        <Link
          component={RouterLink}
          to={productPath(line.productId)}
          underline="hover"
          variant="dataMono"
        >
          {line.sku}
        </Link>
      ),
    },
    {
      id: 'product',
      header: itemsCopy.columns.product,
      render: (line) => <Typography variant="bodyMd">{line.productName}</Typography>,
    },
    {
      id: 'unitPrice',
      header: itemsCopy.columns.unitPrice,
      align: 'right',
      width: 150,
      render: (line) => <Typography variant="dataMono">{formatMoney(line.unitPrice)}</Typography>,
    },
    {
      id: 'quantity',
      header: itemsCopy.columns.quantity,
      align: 'right',
      width: 90,
      render: (line) => <Typography variant="dataMono">{formatCount(line.quantity)}</Typography>,
    },
    {
      id: 'subtotal',
      header: itemsCopy.columns.subtotal,
      align: 'right',
      width: 160,
      render: (line) => (
        <Typography variant="dataMono">{formatMoney(lineSubtotal(line))}</Typography>
      ),
    },
  ]
}

/** Tabla de líneas del detalle de la orden. Presentacional. */
export function OrderItemsTable({ lines, productPath }: OrderItemsTableProps) {
  return (
    <DataTable
      title={itemsCopy.title}
      label={itemsCopy.title}
      columns={buildColumns(productPath)}
      rows={lines}
      getRowId={(line) => line.id}
      footer={itemsCopy.footer(lines.length, totalUnits(lines))}
      emptyMessage={itemsCopy.empty}
    />
  )
}
