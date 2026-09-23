import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { DataTable, StackedCell, StatusBadge } from 'shared/components'
import type { DataTableColumn } from 'shared/components'

import { dashboardCopy } from '../../content'
import type { RecentOrder } from '../../types'
import {
  formatMoney,
  formatOrderId,
  formatShortDate,
  formatTime,
  statusLabel,
  statusVariant,
} from '../../utils/recentOrders'

import type { RecentOrdersTableProps } from './RecentOrdersTable.types'

const copy = dashboardCopy.recentOrders

// Las rutas se registran en `app/router/routes.tsx`, capa que una feature no
// puede importar (architecture.md §3.2): los destinos se declaran acá.
const ORDERS_PATH = '/orders'
const orderPath = (id: number) => `${ORDERS_PATH}/${id}`

// Un id o un importe partidos en dos renglones dejan de leerse como un dato.
const NO_WRAP = { whiteSpace: 'nowrap' } as const

/**
 * Las cinco columnas de S03-Panel, en su orden: id, destino, total, estado y
 * fecha.
 *
 * El id es un enlace de verdad y no un botón con `onClick` —el diseño lo marca
 * como `link`— así el operador puede abrir la orden en otra pestaña sin perder
 * el panel.
 */
const COLUMNS: DataTableColumn<RecentOrder>[] = [
  {
    id: 'id',
    header: copy.columns.id,
    width: 120,
    render: (order) => (
      <Link
        component={RouterLink}
        to={orderPath(order.id)}
        underline="hover"
        // `typography: 'dataMono'` y no una fontFamily suelta: el token trae la
        // familia mono del DS, el tamaño y el peso.
        sx={{ typography: 'dataMono', ...NO_WRAP }}
      >
        {formatOrderId(order.externalOrderId, order.id)}
      </Link>
    ),
  },
  {
    id: 'destination',
    header: copy.columns.destination,
    render: (order) =>
      order.customerAddress === null ? (
        <Typography variant="bodyMd" sx={{ color: 'text.disabled' }}>
          {copy.noDestination}
        </Typography>
      ) : (
        <StackedCell primary={order.customerAddress} secondary={order.customerZipCode} />
      ),
  },
  {
    id: 'total',
    header: copy.columns.total,
    align: 'right',
    width: 128,
    render: (order) => (
      <Typography
        variant="dataMono"
        // Sin total la celda queda atenuada en vez de en blanco: un hueco se lee
        // como un error de carga, y esto es un dato que no existe (las órdenes
        // anteriores a TESIS-114 no lo tienen).
        color={order.totalAmount === null ? 'text.disabled' : undefined}
        sx={NO_WRAP}
      >
        {order.totalAmount === null ? copy.noTotal : formatMoney(order.totalAmount)}
      </Typography>
    ),
  },
  {
    id: 'status',
    header: copy.columns.status,
    width: 116,
    render: (order) => (
      <StatusBadge
        status={statusVariant(order.status)}
        label={statusLabel(order.status)}
        size="sm"
      />
    ),
  },
  {
    id: 'date',
    header: copy.columns.date,
    align: 'right',
    width: 96,
    render: (order) => (
      <StackedCell
        primary={formatShortDate(order.createdAt)}
        secondary={formatTime(order.createdAt)}
      />
    ),
  },
]

/**
 * Las últimas órdenes, en el panel. Presentacional: recibe las filas ya
 * resueltas y sólo sabe cómo dibujarlas.
 *
 * La fila cancelada se pinta con el tono de error, igual que en el listado
 * global: es la única que pide atención en una tabla que se barre de un
 * vistazo.
 */
export function RecentOrdersTable({ orders, loading = false }: RecentOrdersTableProps) {
  return (
    <DataTable
      title={copy.title}
      label={copy.tableLabel}
      columns={COLUMNS}
      rows={orders}
      getRowId={(order) => order.id}
      density="compact"
      rowTone={(order) => (order.status === 'cancelled' ? 'critical' : 'default')}
      toolbarActions={
        <Button
          component={RouterLink}
          to={ORDERS_PATH}
          variant="text"
          size="small"
          endIcon={<ArrowForwardIcon />}
        >
          {copy.viewAll}
        </Button>
      }
      emptyMessage={loading ? copy.loading : copy.empty}
    />
  )
}
