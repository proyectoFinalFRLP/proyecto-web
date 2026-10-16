import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { IconButton, Link, Tooltip, Typography } from '@mui/material'
import { DataTable, StackedCell, StatusBadge } from 'shared/components'
import type { DataTableColumn, StatusVariant } from 'shared/components'
import { formatOrderId, formatRoundMoney } from 'shared/utils'

import { shipmentsCopy } from '../../content'
import type { ShipmentStatus, ShipmentSummary } from '../../types'
import { formatShipmentDate, formatShipmentTime } from '../../utils/format'

import type { ShipmentsTableProps } from './ShipmentsTable.types'

const { columns: columnCopy, cells, status: statusCopy, table } = shipmentsCopy

// El tono de cada estado. Mapa explícito y no un `switch` con default: si el
// backend suma un estado, el compilador marca este archivo en vez de pintarlo
// en gris sin avisar. Es el mismo vocabulario que usa el detalle de la orden.
const TONES: Record<ShipmentStatus, StatusVariant> = {
  pending: 'neutral',
  ready_to_ship: 'info',
  in_transit: 'info',
  delivered: 'success',
}

/** Lo que todavía no existe no se dibuja vacío: se dice por qué falta. */
function Missing({ children }: { children: string }) {
  return (
    <Typography variant="bodyMd" sx={{ color: 'text.disabled' }}>
      {children}
    </Typography>
  )
}

/**
 * Debajo de `md` (el proyector de 800×600) se van el operador y la fecha de
 * alta: el envío ya se identifica por su número y su orden, y lo que se viene a
 * mirar es el costo, el estado y el ojito para abrirlo.
 */
function buildColumns(
  onView: (shipment: ShipmentSummary) => void,
): DataTableColumn<ShipmentSummary>[] {
  return [
    {
      id: 'id',
      header: columnCopy.id,
      sortKey: 'id',
      firstSortDirection: 'desc',
      width: 110,
      render: (shipment) => (
        <Typography variant="dataMono">{cells.shipment(shipment.id)}</Typography>
      ),
    },
    {
      id: 'order',
      header: columnCopy.order,
      // Entra el número de un canal (14 dígitos en Shopify), no sólo el id
      // interno de tres o cuatro (TESIS-181).
      width: 190,
      render: (shipment) => (
        // El detalle del envío vive en su orden: no hay pantalla propia, así
        // que la columna enlaza ahí.
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={() => onView(shipment)}
          sx={{ typography: 'dataMono', textAlign: 'left' }}
        >
          {cells.order(formatOrderId(shipment.externalOrderId, shipment.orderId))}
        </Link>
      ),
    },
    {
      id: 'courier',
      header: columnCopy.courier,
      sortKey: 'courier',
      width: 170,
      hideBelow: 'md',
      render: (shipment) =>
        shipment.courier === null ? (
          <Missing>{cells.noCourier}</Missing>
        ) : (
          <Typography variant="bodyMd">{shipment.courier.name}</Typography>
        ),
    },
    {
      id: 'tracking',
      header: columnCopy.tracking,
      sortKey: 'tracking_number',
      render: (shipment) =>
        shipment.trackingNumber === null ? (
          <Missing>{cells.noTracking}</Missing>
        ) : (
          <Typography variant="dataMono" sx={{ overflowWrap: 'anywhere' }}>
            {shipment.trackingNumber}
          </Typography>
        ),
    },
    {
      id: 'cost',
      header: columnCopy.cost,
      sortKey: 'shipping_cost',
      firstSortDirection: 'desc',
      width: 120,
      align: 'right',
      // Sin cotizar no cuesta cero: no se cotizó. Un 0 ahí afirmaría un envío
      // gratis, que es un dato distinto de un envío sin precio.
      render: (shipment) =>
        shipment.shippingCost === null ? (
          <Missing>{cells.noCost}</Missing>
        ) : (
          <Typography variant="dataMono">{formatRoundMoney(shipment.shippingCost)}</Typography>
        ),
    },
    {
      id: 'status',
      header: columnCopy.status,
      sortKey: 'status',
      width: 150,
      render: (shipment) => (
        <StatusBadge status={TONES[shipment.status]} label={statusCopy[shipment.status]} />
      ),
    },
    {
      id: 'createdAt',
      header: columnCopy.createdAt,
      sortKey: 'created_at',
      firstSortDirection: 'desc',
      width: 124,
      hideBelow: 'md',
      render: (shipment) => (
        <StackedCell
          primary={formatShipmentDate(shipment.createdAt)}
          secondary={formatShipmentTime(shipment.createdAt)}
        />
      ),
    },
    {
      // Una sola acción no justifica un kebab: abrirlo para elegir lo único que
      // hay es un clic de más. El ojito va directo en la fila.
      id: 'actions',
      header: columnCopy.actions,
      width: 72,
      align: 'center',
      pinned: true,
      render: (shipment) => (
        <Tooltip title={table.view}>
          <IconButton
            size="small"
            aria-label={table.viewFor(shipment.id)}
            onClick={() => onView(shipment)}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ]
}

/**
 * Tabla del listado de envíos.
 *
 * Presentacional: no consulta nada ni conoce los filtros. Recibe las filas y el
 * callback, y lo único que decide es cómo se ve cada celda.
 */
export function ShipmentsTable({
  shipments,
  tabs,
  activeTabId,
  onTabChange,
  pagination,
  sort,
  onSortChange,
  emptyMessage,
  onView,
}: ShipmentsTableProps) {
  return (
    <DataTable
      columns={buildColumns(onView)}
      rows={shipments}
      getRowId={(shipment) => shipment.id}
      label={table.label}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={onTabChange}
      emptyMessage={emptyMessage}
      sort={sort}
      onSortChange={onSortChange}
      pagination={pagination}
      paginationLabels={{
        previousLabel: shipmentsCopy.pagination.previous,
        nextLabel: shipmentsCopy.pagination.next,
        pageLabel: shipmentsCopy.pagination.page,
      }}
    />
  )
}
