import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const FieldSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))
