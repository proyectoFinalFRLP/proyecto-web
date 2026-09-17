import { Alert, Button, Typography } from '@mui/material'
import { ProgressSkeleton } from 'shared/components'

import { ordersCopy } from '../content'
import type { ShipmentView } from '../types'

const messages = ordersCopy.detail.shipmentState

interface ShipmentStateMessageProps {
  /** Cualquier estado del envío salvo el resuelto: ése lo dibuja cada panel. */
  view: Exclude<ShipmentView, { kind: 'single' }>
}

/**
 * Lo que muestran los paneles del envío cuando no hay un envío que dibujar. Lo
 * comparten el ciclo de vida y los datos del envío, así los dos dicen lo mismo
 * con las mismas palabras.
 */
export function ShipmentStateMessage({ view }: ShipmentStateMessageProps) {
  switch (view.kind) {
    case 'loading':
      return <ProgressSkeleton lines={2} />
    case 'none':
      return (
        <Typography variant="bodyMd" color="text.secondary">
          {messages.none}
        </Typography>
      )
    case 'duplicated':
      // El modelo garantiza un envío por orden: si llegan más, el dato está
      // mal y mostrar cualquiera de ellos sería afirmar algo que no se sabe.
      return <Alert severity="warning">{messages.duplicated(view.count)}</Alert>
    case 'error':
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={view.onRetry}>
              {messages.retry}
            </Button>
          }
        >
          {messages.error}
        </Alert>
      )
  }
}
