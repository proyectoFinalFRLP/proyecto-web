import { Button, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { DataTable, StackedCell, StatusBadge } from 'shared/components'
import type { DataTableColumn } from 'shared/components'
import { formatCalendarDate, formatOrderId } from 'shared/utils'

import { reportsCopy } from '../../content'
import type { ShipmentAnomaly } from '../../types'
import { formatUnits } from '../../utils/format'
import { anomalyRowTone, anomalyStatusLabel, anomalyStatusVariant } from '../../utils/status'

import type { AnomaliesTableProps } from './AnomaliesTable.types'

const { anomalies: copy } = reportsCopy

// Las rutas viven en `app/router`, capa que una feature no puede importar
// (architecture.md §3.2): los destinos se declaran acá. La bitácora completa es
// el listado de envíos filtrado por los demorados.
const DELAYED_SHIPMENTS_PATH = '/shipments?delayed=true'
const orderPath = (id: number) => `/orders/${id}`

/** Lo que el envío no registra se dice con la marca de «sin dato», atenuada. */
function OptionalText({ value }: { value: string | null }) {
  return (
    <Typography variant="bodyMd" sx={{ color: value === null ? 'text.disabled' : undefined }}>
      {value ?? copy.missing}
    </Typography>
  )
}

/**
 * Las columnas de un envío demorado. Debajo de `md` (el proyector de 800×600)
 * se van el depósito y el operador: lo que se viene a mirar es qué orden, cuán
 * demorada y en qué estado.
 */
const COLUMNS: DataTableColumn<ShipmentAnomaly>[] = [
  {
    id: 'order',
    header: copy.columns.order,
    width: 150,
    // Ahora hay a dónde llevar: el detalle de la orden tiene el ciclo de vida y
    // la bitácora del courier. Un enlace de verdad, para abrirlo en otra pestaña.
    render: ({ order }) => (
      <Link
        component={RouterLink}
        to={orderPath(order.id)}
        underline="hover"
        sx={{ typography: 'dataMono', whiteSpace: 'nowrap' }}
      >
        {formatOrderId(order.externalOrderId, order.id, order.externalOrderNumber)}
      </Link>
    ),
  },
  {
    id: 'origin',
    header: copy.columns.origin,
    hideBelow: 'md',
    truncate: true,
    render: (anomaly) => <OptionalText value={anomaly.originWarehouse} />,
  },
  {
    id: 'courier',
    header: copy.columns.courier,
    width: 150,
    hideBelow: 'md',
    render: (anomaly) => <OptionalText value={anomaly.courier} />,
  },
  {
    id: 'promised',
    header: copy.columns.promised,
    width: 190,
    render: (anomaly) => (
      <StackedCell
        primary={formatCalendarDate(anomaly.promisedDeliveryOn)}
        secondary={copy.daysLate(anomaly.daysLate)}
      />
    ),
  },
  {
    id: 'units',
    header: copy.columns.units,
    align: 'right',
    width: 120,
    render: (anomaly) => (
      <Typography variant="dataMono" sx={{ whiteSpace: 'nowrap' }}>
        {formatUnits(anomaly.units)}
      </Typography>
    ),
  },
  {
    id: 'status',
    header: copy.columns.status,
    width: 140,
    render: (anomaly) => (
      <StatusBadge
        status={anomalyStatusVariant(anomaly.status)}
        label={anomalyStatusLabel(anomaly.status)}
      />
    ),
  },
]

/**
 * «Anomalías recientes» de S14, sobre la `DataTable` del DS: los envíos que
 * pasaron su fecha comprometida, abiertos primero. Presentacional: recibe las
 * filas y decide sólo cómo se ve cada celda.
 */
export function AnomaliesTable({ anomalies }: AnomaliesTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={anomalies}
      getRowId={(anomaly) => anomaly.shipmentId}
      label={copy.tableLabel}
      title={copy.title}
      rowTone={(anomaly) => anomalyRowTone(anomaly.status)}
      toolbarActions={
        <Button component={RouterLink} to={DELAYED_SHIPMENTS_PATH} variant="text" size="small">
          {copy.viewLog}
        </Button>
      }
      emptyMessage={copy.empty}
    />
  )
}
