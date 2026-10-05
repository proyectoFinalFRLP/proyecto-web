import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import { Alert, Box, Button, Divider, List, ListItem, Popover, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import type { ActivityType } from '../../api/activity'
import { useActivity } from '../../hooks/useActivity'
import { LoadingSpinner } from '../LoadingSpinner'

import { EntryIcon } from './ActivityPanel.styles'
import type { ActivityPanelProps } from './ActivityPanel.types'
import { activityContent } from './content'
import { activityLabel, activityPath } from './entry'

// Un ícono por tipo de hecho, para que la fila se reconozca sin leerla. Mapa
// explícito y no un `switch` con default: si el backend suma un tipo, el
// compilador marca este archivo.
const ICONS: Record<ActivityType, ReactNode> = {
  order_created: <ReceiptLongOutlinedIcon fontSize="small" />,
  shipment_dispatched: <LocalShippingOutlinedIcon fontSize="small" />,
  event_failed: <ErrorOutlineIcon fontSize="small" />,
}

// Hora y día de cada hecho. Corto a propósito: el panel es una lista de un
// vistazo, no una bitácora. La zona es la de quien mira, igual que el resto de
// las fechas del producto.
const WHEN = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Lo último que pasó en la empresa, colgando de la campanita (TESIS-163).
 *
 * Hasta ahora la campanita no hacía nada: `Header` nunca pasaba su handler y el
 * badge sólo lo encendía la demo del design system.
 *
 * Vive en `shared/components` y no en una feature porque quien lo monta es el
 * header, que está en `app/` y no puede importar features. Por eso las rutas de
 * destino llegan por props en vez de importarse del router.
 */
// Fila alta y con aire: es un historial que se lee, no un menú que se recorre
// con la vista.
const ROW = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.5,
  py: 1.75,
  px: 2,
} as const

const CLICKABLE = { cursor: 'pointer', color: 'inherit', textDecoration: 'none' } as const

export function ActivityPanel({ anchorEl, onClose, paths }: ActivityPanelProps) {
  const open = anchorEl !== null
  // La consulta se dispara recién al abrirlo: el panel está montado en todas
  // las pantallas y pedir el feed en cada visita sería un request por pantalla.
  const activity = useActivity(open)

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 420, maxWidth: '100vw', mt: 1 } } }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="labelCaps">{activityContent.title}</Typography>
      </Box>
      <Divider />

      {activity.isPending ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="bodyMd" color="text.secondary">
            {activityContent.loading}
          </Typography>
          <LoadingSpinner />
        </Box>
      ) : null}

      {activity.isError ? (
        <Box sx={{ p: 2 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void activity.refetch()}>
                {activityContent.retry}
              </Button>
            }
          >
            {activityContent.error}
          </Alert>
        </Box>
      ) : null}

      {/* Vacío no es un error: es una empresa donde todavía no pasó nada. */}
      {activity.data?.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="bodyMd" color="text.secondary">
            {activityContent.empty}
          </Typography>
        </Box>
      ) : null}

      <List disablePadding sx={{ maxHeight: 420, overflowY: 'auto' }}>
        {(activity.data ?? []).map((entry) => {
          const to = activityPath(entry, paths)

          return (
            // Sin destino no es un botón: `ListItemButton` se anuncia como
            // uno aunque se lo monte sobre un `div`, y una fila que informa y
            // nada más no tiene que prometer una acción. Tampoco cierra el
            // panel al tocarla, que era la otra mitad de la misma promesa.
            <ListItem
              key={entry.id}
              disablePadding={to !== null}
              divider
              sx={ROW}
              {...(to === null
                ? {}
                : { component: Link, to, onClick: onClose, sx: { ...ROW, ...CLICKABLE } })}
            >
              <EntryIcon>{ICONS[entry.type]}</EntryIcon>
              <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="bodyMd">{activityLabel(entry)}</Typography>
                <Typography variant="labelSm" color="text.secondary">
                  {WHEN.format(new Date(entry.occurredAt))}
                </Typography>
              </Box>
            </ListItem>
          )
        })}
      </List>
    </Popover>
  )
}
