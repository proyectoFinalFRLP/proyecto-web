import { Box, Typography } from '@mui/material'

interface StackedCellProps {
  primary: string
  secondary?: string | null
  /** Tipografía monoespaciada para ids e importes, como en el diseño. */
  mono?: boolean
}

/**
 * Celda de dos líneas: el dato arriba y su contexto abajo, atenuado.
 *
 * La usan «Fecha y hora» (fecha / hora) y «Destino» (dirección / código
 * postal). Sin `secondary` colapsa a una sola línea y la fila no cambia de
 * alto, así la tabla no se desalinea cuando una orden no tiene dirección.
 */
export function StackedCell({ primary, secondary, mono = false }: StackedCellProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{
          fontFamily: mono ? 'monospace' : undefined,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {primary}
      </Typography>
      {secondary ? (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {secondary}
        </Typography>
      ) : null}
    </Box>
  )
}
