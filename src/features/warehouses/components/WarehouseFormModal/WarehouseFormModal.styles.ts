import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Localidad y provincia en una fila, como el domicilio de una orden; apiladas
// cuando no entran.
export const LocalityRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
}))
