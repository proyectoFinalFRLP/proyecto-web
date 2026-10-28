import { Box, Chip, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

export const Cell = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

export const CauseRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 0,
}))

// `dataMono` y no fontFamily suelto: el token trae la familia mono del Design
// System. El código no se achica: es lo que se le dicta a soporte.
export const CodeChip = styled(Chip)(({ theme }) => ({
  flexShrink: 0,
  '& .MuiChip-label': { ...theme.typography.dataMono },
}))

// El mensaje sí se recorta: en una sola línea, como el resto de la fila.
export const Message = styled(Typography)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
})
