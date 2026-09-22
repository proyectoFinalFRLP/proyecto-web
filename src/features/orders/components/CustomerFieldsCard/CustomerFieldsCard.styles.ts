import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Dos columnas en el diseño; una sola cuando no entran.
export const FieldsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
}))
