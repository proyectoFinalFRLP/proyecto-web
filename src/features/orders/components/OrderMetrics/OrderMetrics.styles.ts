import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Las cuatro métricas de S08 en una fila. `auto-fit` con un mínimo las baja a
// dos y a una columna al angostarse, sin media queries.
export const MetricsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
}))
