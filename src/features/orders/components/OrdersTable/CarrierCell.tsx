import { Avatar, Box, Typography } from '@mui/material'

import { ordersCopy } from '../../content'

import { carrierInitials } from './carrierInitials'

interface CarrierCellProps {
  carrier: string | null
}

/**
 * Courier del envío: cuadrado con iniciales y nombre al lado, como en el
 * diseño.
 *
 * Sin courier no se dibuja el cuadrado. Un recuadro vacío en una columna que
 * mayormente está vacía —el courier se asigna recién al confirmar el despacho—
 * sería ruido en cada fila, así que queda sólo el texto atenuado.
 */
export function CarrierCell({ carrier }: CarrierCellProps) {
  if (carrier === null) {
    return (
      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        {ordersCopy.cells.noCarrier}
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
          fontSize: 12,
          fontWeight: 600,
          bgcolor: 'action.selected',
          color: 'text.secondary',
        }}
      >
        {carrierInitials(carrier)}
      </Avatar>
      <Typography
        variant="body2"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {carrier}
      </Typography>
    </Box>
  )
}
