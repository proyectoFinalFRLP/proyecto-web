import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Ciudad, provincia y código postal en una fila, como en S06; apilados cuando
// no entran.
export const LocalityGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
}))
