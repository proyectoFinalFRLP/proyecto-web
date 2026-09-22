import { Box, Typography } from '@mui/material'

export interface StackedCellProps {
  primary: string
  secondary?: string | null
}

/**
 * Celda de dos líneas: el dato arriba y su contexto abajo, atenuado.
 *
 * Nació en el listado de órdenes («Fecha y hora», «Destino») y subió a
 * `shared/` cuando la tabla de anomalías de Reportes necesitó la misma celda
 * para «Nodo» (nombre / código) — Regla de Dos. Sin `secondary` colapsa a una
 * sola línea y la fila no cambia de alto, así la tabla no se desalinea cuando
 * una orden no tiene dirección.
 */
export function StackedCell({ primary, secondary }: StackedCellProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Typography
        variant="bodyMd"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {primary}
      </Typography>
      {secondary ? (
        <Typography variant="labelSm" sx={{ color: 'text.secondary' }}>
          {secondary}
        </Typography>
      ) : null}
    </Box>
  )
}
