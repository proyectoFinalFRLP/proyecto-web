import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { StatusBadge } from 'shared/components'

import { reportsCopy } from '../../content'

import { PeriodSelect } from './PeriodSelect'
import { Actions, HeaderRow, Heading, TitleLine } from './ReportsHeader.styles'
import type { ReportsHeaderProps } from './ReportsHeader.types'

const { page: pageCopy, actions: actionCopy } = reportsCopy

/**
 * Encabezado de S14: título, bajada y las dos acciones del período.
 *
 * La exportación queda visible y apagada, como el remito del detalle de orden:
 * no hay endpoint que la resuelva, y además la decisión del proyecto es dejar
 * la exportación para el final, cuando el modelo de datos esté completo.
 */
export function ReportsHeader({ period, onPeriodChange, sampleData = false }: ReportsHeaderProps) {
  return (
    <HeaderRow>
      <Heading>
        <TitleLine>
          <Typography variant="h1" component="h1">
            {pageCopy.title}
          </Typography>
          {/* Mientras los agregados no salgan de la API, la pantalla lo dice:
              un número inventado sin aviso se lee como un número real. */}
          {sampleData ? (
            <Tooltip title={pageCopy.sampleDataHint}>
              <Box component="span">
                <StatusBadge
                  status="neutral"
                  size="sm"
                  icon={<InfoOutlinedIcon />}
                  label={pageCopy.sampleData}
                />
              </Box>
            </Tooltip>
          ) : null}
        </TitleLine>
        <Typography variant="bodyMd" color="text.secondary">
          {pageCopy.subtitle}
        </Typography>
      </Heading>

      <Actions>
        <PeriodSelect value={period} onChange={onPeriodChange} />
        {/* El botón deshabilitado no dispara eventos de puntero, así que el
            Tooltip necesita un envoltorio propio para recibir el hover. */}
        <Tooltip title={actionCopy.exportPending}>
          <Box component="span">
            <Button variant="contained" startIcon={<DownloadOutlinedIcon />} disabled>
              {actionCopy.export}
            </Button>
          </Box>
        </Tooltip>
      </Actions>
    </HeaderRow>
  )
}
