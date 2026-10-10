import { Avatar, Box, Typography } from '@mui/material'

import { ordersCopy } from '../../content'

import { carrierInitials } from './carrierInitials'

interface CarrierCellProps {
  carrier: string | null
  /** La orden la retira el cliente: no espera courier (TESIS-162). */
  pickup?: boolean
}

/**
 * Courier del envío: cuadrado con iniciales y nombre al lado, como en el
 * diseño.
 *
 * Sin courier no se dibuja el cuadrado. Un recuadro vacío en una columna que
 * mayormente está vacía —el courier se asigna recién al confirmar el despacho—
 * sería ruido en cada fila, así que queda sólo el texto atenuado.
 *
 * Con retiro en el local la celda lo dice en vez de quedar vacía: esa orden no
 * está esperando un courier, y hasta TESIS-162 se veía igual que una a la que
 * le falta el despacho.
 */
export function CarrierCell({ carrier, pickup = false }: CarrierCellProps) {
  if (carrier === null) {
    return (
      <Typography variant="bodyMd" sx={{ color: 'text.disabled' }}>
        {pickup ? ordersCopy.cells.pickup : ordersCopy.cells.noCarrier}
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Avatar
        variant="rounded"
        aria-hidden
        sx={{
          width: 28,
          height: 28,
          typography: 'labelMd',
          bgcolor: 'action.selected',
          color: 'text.secondary',
        }}
      >
        {carrierInitials(carrier)}
      </Avatar>
      <Typography
        variant="bodyMd"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {carrier}
      </Typography>
    </Box>
  )
}
