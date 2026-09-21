import { Box, Button, Tooltip, Typography } from '@mui/material'
import { DataTable, StackedCell, StatusBadge } from 'shared/components'
import type { DataTableColumn } from 'shared/components'

import { reportsCopy } from '../../content'
import type { RegionalAnomaly } from '../../types'
import { formatUnits } from '../../utils/format'
import { anomalyRowTone, anomalyStatusLabel, anomalyStatusVariant } from '../../utils/status'

import type { AnomaliesTableProps } from './AnomaliesTable.types'

const { anomalies: copy } = reportsCopy

/** «#INC-8892» — el incidente con el numeral que le pone el diseño. */
function formatIncidentId(id: string) {
  return `#${id}`
}

// Las cinco columnas de S14, en su orden y con sus anchos.
const COLUMNS: DataTableColumn<RegionalAnomaly>[] = [
  {
    id: 'id',
    header: copy.columns.id,
    width: 130,
    // El diseño lo pinta como enlace, pero no hay pantalla de incidente a la
    // que llevar: va en monoespaciada y sin color de acción, que prometería un
    // clic que no hace nada. Un id partido en dos líneas deja de ser un id.
    render: (anomaly) => (
      <Typography variant="dataMono" sx={{ whiteSpace: 'nowrap' }}>
        {formatIncidentId(anomaly.id)}
      </Typography>
    ),
  },
  {
    id: 'node',
    header: copy.columns.node,
    render: (anomaly) => <StackedCell primary={anomaly.node.name} secondary={anomaly.node.code} />,
  },
  {
    id: 'varianceType',
    header: copy.columns.varianceType,
    width: 200,
    render: (anomaly) => <Typography variant="bodyMd">{anomaly.varianceType}</Typography>,
  },
  {
    id: 'impactedUnits',
    header: copy.columns.impactedUnits,
    align: 'right',
    width: 160,
    render: (anomaly) => (
      <Typography variant="dataMono" sx={{ whiteSpace: 'nowrap' }}>
        {formatUnits(anomaly.impactedUnits)}
      </Typography>
    ),
  },
  {
    id: 'status',
    header: copy.columns.status,
    width: 150,
    render: (anomaly) => (
      <StatusBadge
        status={anomalyStatusVariant(anomaly.status)}
        label={anomalyStatusLabel(anomaly.status)}
      />
    ),
  },
]

/**
 * «Anomalías recientes» de S14, sobre la `DataTable` del DS. Presentacional:
 * recibe las filas y decide sólo cómo se ve cada celda.
 */
export function AnomaliesTable({ anomalies }: AnomaliesTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={anomalies}
      getRowId={(anomaly) => anomaly.id}
      label={copy.tableLabel}
      title={copy.title}
      rowTone={(anomaly) => anomalyRowTone(anomaly.status)}
      toolbarActions={
        // El botón deshabilitado no dispara eventos de puntero, así que el
        // Tooltip necesita un envoltorio propio para recibir el hover.
        <Tooltip title={copy.viewLogPending}>
          <Box component="span">
            <Button variant="text" size="small" disabled>
              {copy.viewLog}
            </Button>
          </Box>
        </Tooltip>
      }
      emptyMessage={copy.empty}
    />
  )
}
