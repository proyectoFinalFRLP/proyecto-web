import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { Button, Typography } from '@mui/material'

import { reportsCopy } from '../../content'

import { PeriodSelect } from './PeriodSelect'
import { Actions, HeaderRow, Heading } from './ReportsHeader.styles'
import type { ReportsHeaderProps } from './ReportsHeader.types'

const { page: pageCopy, actions: actionCopy } = reportsCopy

/**
 * Encabezado de S14: título, bajada y las dos acciones del período.
 *
 * La exportación baja un CSV con lo que muestra la pantalla para el período
 * elegido. No hay endpoint que la resuelva y no hace falta: la pantalla ya
 * tiene todos los agregados, y armarlo de este lado garantiza que el archivo
 * diga exactamente lo que se ve.
 */
export function ReportsHeader({ period, onPeriodChange, onExport }: ReportsHeaderProps) {
  return (
    <HeaderRow>
      <Heading>
        <Typography variant="h1" component="h1">
          {pageCopy.title}
        </Typography>
        <Typography variant="bodyMd" color="text.secondary">
          {pageCopy.subtitle}
        </Typography>
      </Heading>

      <Actions>
        <PeriodSelect value={period} onChange={onPeriodChange} />
        <Button variant="contained" startIcon={<DownloadOutlinedIcon />} onClick={onExport}>
          {actionCopy.export}
        </Button>
      </Actions>
    </HeaderRow>
  )
}
