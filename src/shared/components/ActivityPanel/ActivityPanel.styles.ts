import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Tile del tipo de hecho, a la izquierda de cada fila. Misma geometría que los
// tiles del panel: 32px con el ícono adentro, sobre superficie tonal del tema.
export const EntryIcon = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.vars.palette.background.containerHighest,
  color: theme.vars.palette.text.secondary,
  '& svg': { display: 'block' },
}))
