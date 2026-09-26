import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Ícono de advertencia de las acciones destructivas, en recuadro tonal: el mismo
// par container/main que usan los badges para la intención de error.
export const DangerIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: theme.spacing(5),
  height: theme.spacing(5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.vars.palette.error.container,
  color: theme.vars.palette.error.main,
}))
