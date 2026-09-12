import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Link, Typography } from '@mui/material'
import { DataTable, StatusBadge } from 'shared/components'
import type { DataTableAction, DataTableColumn } from 'shared/components'

import { ordersCopy } from '../../content'
import type { OrderSummary } from '../../types'
import { formatMoney, formatOrderDate, formatOrderId, formatOrderTime } from '../../utils/format'
import { statusLabel, statusRowTone, statusVariant } from '../../utils/status'

import { CarrierCell } from './CarrierCell'
import type { OrdersTableProps } from './OrdersTable.types'
import { StackedCell } from './StackedCell'

const { columns: columnCopy, cells, actions: actionCopy, page } = ordersCopy

/**
 * Las siete columnas del listado, en el orden del diseño. Se construyen con el
 * callback de navegación porque la primera columna y el menú de acciones llevan
 * al mismo lugar, y así ese destino se define una sola vez.
 */
function buildColumns(onView: (order: OrderSummary) => void): DataTableColumn<OrderSummary>[] {
  return [
    {
      id: 'id',
      header: columnCopy.id,
      width: 132,
      render: (order) => (
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={() => onView(order)}
          sx={{ fontFamily: 'monospace', fontSize: 14, textAlign: 'left' }}
        >
          {formatOrderId(order.externalOrderId, order.id)}
        </Link>
      ),
    },
    {
      id: 'date',
      header: columnCopy.date,
      width: 124,
      render: (order) => (
        <StackedCell
          primary={formatOrderDate(order.createdAt)}
          secondary={formatOrderTime(order.createdAt)}
        />
      ),
    },
    {
      id: 'destination',
      header: columnCopy.destination,
      render: (order) =>
        order.customerAddress === null ? (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {cells.noDestination}
          </Typography>
        ) : (
          <StackedCell primary={order.customerAddress} secondary={order.customerZipCode} />
        ),
    },
    {
      id: 'status',
      header: columnCopy.status,
      width: 128,
      render: (order) => (
        <StatusBadge status={statusVariant(order.status)} label={statusLabel(order.status)} />
      ),
    },
    {
      id: 'carrier',
      header: columnCopy.carrier,
      width: 170,
      render: (order) => <CarrierCell carrier={order.carrier} />,
    },
    {
      id: 'total',
      header: columnCopy.total,
      align: 'right',
      width: 140,
      render: (order) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
          // Sin total la celda queda atenuada en vez de en blanco: un hueco
          // se lee como un error de carga y esto es un dato que no existe.
          color={order.totalAmount === null ? 'text.disabled' : undefined}
        >
          {order.totalAmount === null ? cells.noTotal : formatMoney(order.totalAmount)}
        </Typography>
      ),
    },
  ]
}

/**
 * Tabla del listado de órdenes.
 *
 * Es presentacional: no consulta nada ni conoce los filtros. Recibe las filas y
 * los callbacks, y lo único que decide es cómo se ve cada celda.
 */
export function OrdersTable({
  orders,
  tabs,
  activeTabId,
  onTabChange,
  pagination,
  onView,
  onEdit,
}: OrdersTableProps) {
  const actions: DataTableAction<OrderSummary>[] = [
    {
      id: 'view',
      label: actionCopy.view,
      icon: <VisibilityOutlinedIcon fontSize="small" />,
      onSelect: onView,
    },
    {
      id: 'edit',
      label: actionCopy.edit,
      icon: <EditOutlinedIcon fontSize="small" />,
      onSelect: onEdit,
    },
  ]

  return (
    <DataTable
      columns={buildColumns(onView)}
      rows={orders}
      getRowId={(order) => order.id}
      label={page.tableLabel}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={onTabChange}
      rowTone={(order) => statusRowTone(order.status)}
      actions={actions}
      actionsHeader={columnCopy.actions}
      getActionsLabel={(order) =>
        actionCopy.menuFor(formatOrderId(order.externalOrderId, order.id))
      }
      pagination={pagination}
      paginationLabels={{
        previousLabel: ordersCopy.pagination.previous,
        nextLabel: ordersCopy.pagination.next,
        pageLabel: ordersCopy.pagination.page,
      }}
      emptyMessage={page.empty}
    />
  )
}
